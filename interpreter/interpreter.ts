import {AstPrinter} from './astprinter';
import {BooleanValue, CallableValue, NumberValue, ReferenceValue, StringValue} from './values/typed';
import {CALL_ASSERT_FALSE} from './passes/partialcallables';
import {Callable} from './callables/callable';
import {Environment} from './environment';
import {ExpressionEvaluator} from './expressionevaluator';
import {Expr, BinaryExpr, CallExpr, FunctionExpr, GroupingExpr, LiteralExpr, LogicalExpr, ReferenceExpr, TernaryExpr, UnaryExpr, VariableExpr, ExprVisitor} from './parser/expr';
import {FunctionCallable} from './callables/function';
import {MATHLIB_BUILTINS, MATHLIB_STATEMENTS} from './mathlib';
import {NativeCallable} from './callables/native';
import {Parser} from './parser/parser';
import {Scanner} from './parser/scanner';
import {Stmt, AssignmentStmt, ConstStmt, ExpressionStmt, StmtVisitor} from './parser/stmt';
import {Token, TokenType} from './parser/token';
import {Value} from './values/value';

export class Interpreter implements ExprVisitor<Value<any>>, StmtVisitor<Value<any>>, ExpressionEvaluator {
    private environments: Environment[] = [new Environment()];
    private errors: string[] = [];

    constructor() {
        this.createEnvironment();
    }

    createEnvironment() {
        MATHLIB_BUILTINS.forEach((callable, name) => this.environment().defineConstant(name, new CallableValue(callable)));
        this.run(MATHLIB_STATEMENTS);

        if (this.errors.length > 0) {
            for (const e of this.errors) {
                console.error(e);
            }
        }
    }

    environment(): Environment {
        return this.environments[this.environments.length - 1];
    }

    run(source: string): string[] {
        this.errors = [];

        const scanner = new Scanner(source, this.scannerError.bind(this));
        const tokens = scanner.scanTokens();

        if (this.errors.length > 0) {
            return this.errors;
        }

        const parser = new Parser(tokens, this.parserError.bind(this));
        const statements : Stmt[] = parser.parse();

        if (this.errors.length > 0) {
            return this.errors;
        }

        const results: string[] = [];

        const astPrinter = new AstPrinter();
        statements.forEach((stmt) => results.push(astPrinter.print(stmt)));

        try {
            for (const statement of statements) {
                const ret = this.execute(statement);
                if (ret !== null) {
                    results.push(ret.toString());
                }
            }
        } catch (e) {
            this.interpreterError(e);
        }

        if (this.errors.length > 0) {
            return results.concat(this.errors);
        }
        
        return results;
    }

    evaluateWithEnvironment(expr: Expr, env: Environment): Value<any> {
        this.environments.push(env);
        const result = this.evaluate(expr);
        this.environments.pop();
        return result;
    }

    execute(stmt: Stmt): Value<any> {
        return stmt.accept(this);
    }

    visitExpressionStmt(stmt: ExpressionStmt): Value<any> {
        return this.evaluate(stmt.expression);
    }

    visitAssignmentStmt(stmt: AssignmentStmt): Value<any> {
        let value = this.evaluate(stmt.expression);

        if (this.environment().isDefined(stmt.name.lexeme)) {
            if (!this.environment().isConstant(stmt.name.lexeme)) {
                const parent = this.environment().get(stmt.name.lexeme);

                if (parent instanceof CallableValue && value instanceof CallableValue) {
                    const parentCallable = parent.assertCallable();
                    const callable = value.assertCallable();

                    if (parentCallable instanceof NativeCallable) {
                        return this.interpreterError('Cannot add partial function to native functions');
                    }

                    if (callable instanceof FunctionCallable) {
                        (parentCallable as FunctionCallable).concat(callable);
                        value = new CallableValue(parentCallable);
                    }
                }
            }
        }

        this.environment().define(stmt.name.lexeme, value);
        return value;
    }

    visitConstStmt(stmt: ConstStmt): Value<any> {
        const value = this.evaluate(stmt.expression);
        this.environment().defineConstant(stmt.name.lexeme, value);
        return value;
    }

    visitBinaryExpr(expr: BinaryExpr): Value<any> {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.MINUS:
                return new NumberValue(left.assertNumber() - right.assertNumber());
            case TokenType.PLUS:
                return new NumberValue(left.assertNumber() + right.assertNumber());
            case TokenType.SLASH:
                return new NumberValue(left.assertNumber() / right.assertNumber());
            case TokenType.BACKSLASH:
                return new NumberValue(Math.floor(left.assertNumber() / right.assertNumber()));
            case TokenType.PERCENT:
                return new NumberValue(left.assertNumber() % right.assertNumber());
            case TokenType.STAR:
                return new NumberValue(left.assertNumber() * right.assertNumber());
            case TokenType.CARET:
                return new NumberValue(Math.pow(left.assertNumber(), right.assertNumber()));
            case TokenType.BANG_EQUAL:
                left.assertSameAs(right);
                return new BooleanValue(left.value() !== right.value());
            case TokenType.EQUAL_EQUAL:
                left.assertSameAs(right);
                return new BooleanValue(left.value() === right.value());
            case TokenType.GREATER:
                return new BooleanValue(left.assertNumber() > right.assertNumber());
            case TokenType.GREATER_EQUAL:
                return new BooleanValue(left.assertNumber() >= right.assertNumber());
            case TokenType.LESS:
                return new BooleanValue(left.assertNumber() < right.assertNumber());
            case TokenType.LESS_EQUAL:
                return new BooleanValue(left.assertNumber() <= right.assertNumber());
            default:
                return this.unimplementedOperator(expr.operator.type);
        }
    }

    visitTernaryExpr(expr: TernaryExpr): Value<any> {
        return this.evaluate(expr.first).assertBoolean() ?
            this.evaluate(expr.second) :
            this.evaluate(expr.third);
    }

    visitCallExpr(expr: CallExpr): Value<any> {
        const fn: Callable = this.evaluate(expr.callee).assertCallable();
        const arity = fn.arity();
        const args = expr.args;

        if (args.length >= arity[0] && (arity.length == 1 || args.length <= arity[1])) {
            return fn.call(args.map(arg => this.evaluate(arg)), this);
        }
        return this.interpreterError(`Invalid number of arguments passed to function ${name}`);
    }

    visitFunctionExpr(expr: FunctionExpr): Value<any> {
        // expr.cond || TRUE ? expr.body : ASSERT(FALSE)
        const ternary = new TernaryExpr(
            expr.cond ? expr.cond : new LiteralExpr(true),
            expr.body,
            CALL_ASSERT_FALSE);
        return new CallableValue(new FunctionCallable(expr.args, ternary));
    }

    visitGroupingExpr(expr: GroupingExpr): Value<any> {
        return this.evaluate(expr.expression);
    }

    visitLiteralExpr(expr: LiteralExpr): Value<any> {
        switch (typeof expr.value) {
            case 'boolean':
                return new BooleanValue(expr.value);
            case 'number':
                return new NumberValue(expr.value);
            case 'string':
                return new StringValue(expr.value);
            default:
                return this.interpreterError(`Type ${typeof expr.value} not supported in literals`);
        }
    }

    visitLogicalExpr(expr: LogicalExpr): Value<any> {
        const left = this.evaluate(expr.left).assertBoolean();
        
        switch (expr.operator.type) {
            case TokenType.PIPE_PIPE:
                return new BooleanValue(left || this.evaluate(expr.right).assertBoolean());
            case TokenType.AND_AND:
                return new BooleanValue(left && this.evaluate(expr.right).assertBoolean());
            default:
                return this.unimplementedOperator(expr.operator.type);
        }
    }

    visitReferenceExpr(expr: ReferenceExpr): Value<any> {
        return new ReferenceValue(expr.ref.lexeme);
    }

    visitUnaryExpr(expr: UnaryExpr): Value<any> {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.MINUS:
                return new NumberValue(-right.assertNumber());
            case TokenType.BANG:
                return new BooleanValue(!right.assertBoolean());
            case TokenType.PIPE:
                return new NumberValue(Math.abs(right.assertNumber()));
            default:
                return this.unimplementedOperator(expr.operator.type);
        }
    }

    visitVariableExpr(expr: VariableExpr): Value<any> {
        return this.environment().get(expr.name.lexeme);
    }

    private evaluate(expr: Expr): Value<any> {
        return expr.accept(this);
    }

    private unimplementedOperator(type: TokenType): null {
        const typeStr = TokenType[type];
        this.interpreterError(`unimplemented token ${typeStr}`);
        return null;
    }

    private scannerError(position: number, message: string) {
        this.errors.push(`Error @ ${position}: ${message}`);
    }

    private parserError(token: Token, message: string) {
        this.errors.push(`Error @ ${token.lexeme}: ${message}`);
    }

    private interpreterError(message: string): null {
        this.errors.push(`Interpreter error: ${message}`);
        return null;
    }
}