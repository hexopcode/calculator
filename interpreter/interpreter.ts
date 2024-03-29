import {AnyValue, Value} from './values/value';
import {BooleanValue, CallableValue, ErrorValue, NumberValue, ReferenceValue, StringValue, VectorValue} from './values/typed';
import {BUILTINS} from './builtins';
import {CALL_ASSERT_FALSE} from './passes/partialcallables';
import {Callable} from './callables/callable';
import {Environment} from './environment';
import {ExpressionEvaluator} from './expressionevaluator';
import {Expr, AssignExpr, BinaryExpr, CallExpr, FunctionExpr, GroupingExpr, LiteralExpr, LogicalExpr, ReferenceExpr, TernaryExpr, UnaryExpr, VariableExpr, VectorExpr, WithExpr, ExprVisitor} from './parser/expr';
import {FunctionCallable} from './callables/function';
import {NativeCallable} from './callables/native';
import {Parser} from './parser/parser';
import {Scanner} from './parser/scanner';
import {Stmt, ExpressionStmt, ImportStmt, PragmaStmt, StmtVisitor} from './parser/stmt';
import {Token, TokenType} from './parser/token';

export type InterpreterResultType = (Stmt|Value<any>|ErrorValue);

export class InterpreterResult {
    /* mutable */ hasError: boolean = false;
    readonly all: InterpreterResultType[] = [];
};

const EMPTY_INTERPRETER_RESULT = new InterpreterResult();

export type InterpreterPragmaAttributes = Map<string, (boolean|string|number)>;

export class InterpreterPragma {
    readonly name: string;
    readonly attributes: InterpreterPragmaAttributes;

    constructor(name: string, attributes: InterpreterPragmaAttributes) {
        this.name = name;
        this.attributes = attributes;
    }
}

const NO_PATH: string = '<INLINE>';

export class Interpreter implements ExprVisitor<Value<any>>, StmtVisitor<Promise<Value<any>>>, ExpressionEvaluator {
    private environments: Environment[] = [new Environment()];
    private importedLibraries: Set<string> = new Set();

    constructor() {
        BUILTINS.forEach((callable, name) => this.environment().defineConstant(name, new CallableValue(callable)));
    }

    async createEnvironment(): Promise<InterpreterResult> {
        return await this.run('IMPORT "MATHLIB/BOOTSTRAP.MATH"');
    }

    environment(): Environment {
        return this.environments[this.environments.length - 1];
    }

    async run(source: string, path: string = NO_PATH): Promise<InterpreterResult> {
        const result = new InterpreterResult();

        const scanner = new Scanner(source, this.scannerError.bind(this, result, path));
        const tokens = scanner.scanTokens();

        if (result.hasError) {
            return result;
        }

        const parser = new Parser(tokens, this.parserError.bind(this, result, path));
        const statements : Stmt[] = parser.parse();

        if (result.hasError) {
            result.all.push(...statements);
            return result;
        }

        for (const statement of statements) {
            try {
                const ret = await this.execute(statement);
                if (ret instanceof AnyValue) {
                    if (ret.value() instanceof InterpreterPragma) {
                        result.all.push(ret.value());
                        result.all.push(statement);
                    } else {
                        const childResult = ret.value() as InterpreterResult;
                        result.all.push(statement);
                        result.all.push(...childResult.all);
                        if (childResult.hasError) {
                            result.hasError = true;
                            break;
                        }
                    }
                } else {
                    result.all.push(statement);
                    result.all.push(ret);
                }
            } catch (e) {
                result.hasError = true;
                result.all.push(statement);
                result.all.push(new ErrorValue(e));
                break;
            }
        }
        

        return result;
    }

    evaluateWithEnvironment(expr: Expr, env: Environment): Value<any> {
        this.environments.push(env);
        const result = this.evaluate(expr);
        this.environments.pop();
        return result;
    }

    async execute(stmt: Stmt): Promise<Value<any>> {
        return stmt.accept(this);
    }

    async visitExpressionStmt(stmt: ExpressionStmt): Promise<Value<any>> {
        return this.evaluate(stmt.expression);
    }

    async visitImportStmt(stmt: ImportStmt): Promise<Value<any>> {
        const path = stmt.path.literal;
        if (this.importedLibraries.has(path)) {
            return new AnyValue(EMPTY_INTERPRETER_RESULT);
        }

        this.importedLibraries.add(path);
        const source = await fetch(path).then(response => response.text());
        const result = await this.run(source, path);

        return new AnyValue(result);
    }

    async visitPragmaStmt(stmt: PragmaStmt): Promise<Value<any>> {
        const name = stmt.name.lexeme;
        const attributes: InterpreterPragmaAttributes = new Map();

        stmt.attributes.forEach((value: Token, key: Token) => {
            const attr = key.lexeme;
            let attrValue: (boolean|string|number);
            switch (value.type) {
                case TokenType.IDENTIFIER:
                    attrValue = value.lexeme;
                    break;
                case TokenType.FALSE:
                    attrValue = false;
                    break;
                case TokenType.TRUE:
                    attrValue = true;
                    break;
                case TokenType.NUMBER:
                    attrValue = value.literal as number;
                    break;
                default:
                    throw this.interpreterError(`Invalid pragma attribute value: ${value.lexeme}`);
            }
            attributes.set(attr, attrValue);
        });

        return new AnyValue(new InterpreterPragma(name, attributes));
    }

    visitAssignExpr(expr: AssignExpr): Value<any> {
        let value = this.evaluate(expr.value);

        if (this.environment().isDefined(expr.name.lexeme)) {
            if (!this.environment().isConstant(expr.name.lexeme)) {
                const parent = this.environment().get(expr.name.lexeme);

                if (parent instanceof CallableValue && value instanceof CallableValue) {
                    const parentCallable = parent.assertCallable();
                    const callable = value.assertCallable();

                    if (parentCallable instanceof NativeCallable) {
                        throw this.interpreterError('Cannot add partial function to native functions');
                    }

                    if (callable instanceof FunctionCallable) {
                        (parentCallable as FunctionCallable).concat(callable);
                        value = new CallableValue(parentCallable);
                    }
                }
            }
        }

        if (expr.isConst) {
            this.environment().defineConstant(expr.name.lexeme, value);
        } else {
            this.environment().define(expr.name.lexeme, value);
        }
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
                return new BooleanValue(!left.equals(right));
            case TokenType.EQUAL_EQUAL:
                left.assertSameAs(right);
                return new BooleanValue(left.equals(right));
            case TokenType.GREATER:
                return new BooleanValue(left.assertNumber() > right.assertNumber());
            case TokenType.GREATER_EQUAL:
                return new BooleanValue(left.assertNumber() >= right.assertNumber());
            case TokenType.LESS:
                return new BooleanValue(left.assertNumber() < right.assertNumber());
            case TokenType.LESS_EQUAL:
                return new BooleanValue(left.assertNumber() <= right.assertNumber());
            default:
                throw this.unimplementedOperator(expr.operator.type);
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
        throw this.interpreterError(`Invalid number of arguments passed to function ${name}`);
    }

    visitFunctionExpr(expr: FunctionExpr): Value<any> {
        // expr.cond || TRUE ? expr.body : ASSERT(FALSE)
        const ternary = new TernaryExpr(
            expr.cond ? expr.cond : new LiteralExpr(true),
            expr.body,
            CALL_ASSERT_FALSE);
        return new CallableValue(new FunctionCallable(expr.args, expr.destructured, ternary));
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
                throw this.interpreterError(`Type ${typeof expr.value} not supported in literals`);
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
                throw this.unimplementedOperator(expr.operator.type);
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
                throw this.unimplementedOperator(expr.operator.type);
        }
    }

    visitVariableExpr(expr: VariableExpr): Value<any> {
        return this.environment().get(expr.name.lexeme);
    }

    visitVectorExpr(expr: VectorExpr): Value<any> {
        const elements: Value<any>[] = [];
        for (const el of expr.elements) {
            elements.push(this.evaluate(el));
        }
        return new VectorValue(elements);
    }

    visitWithExpr(expr: WithExpr): Value<any> {
        const env: Environment = new Environment(this.environment());
        for (const local of expr.locals) {
            env.define(local.name.lexeme, this.evaluate(local.value));
        }
        return this.evaluateWithEnvironment(expr.expr, env);
    }

    private evaluate(expr: Expr): Value<any> {
        return expr.accept(this);
    }

    private unimplementedOperator(type: TokenType): Error {
        const typeStr = TokenType[type];
        return this.interpreterError(`Unimplemented operator ${typeStr}`);
    }

    private scannerError(result: InterpreterResult, path: string, line: number, column: number, message: string) {
        result.hasError = true;
        result.all.push(new ErrorValue(new Error(`Tokenizer error @ ${path}:${line}:${column}: ${message}`)));
    }

    private parserError(result: InterpreterResult, path: string, token: Token, message: string) {
        result.hasError = true;
        result.all.push(new ErrorValue(new Error(`Parser error @ ${path}:${token.line}:${token.column}: ${message}`)));
    }

    private interpreterError(message: string): Error {
        return new Error(`Interpreter error: ${message}`);
    }
}