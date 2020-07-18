import {AstPrinter} from './astprinter';
import {Callable} from './callable';
import {Environment} from './environment';
import {Expr, BinaryExpr, CallExpr, GroupingExpr, LiteralExpr, UnaryExpr, VariableExpr, ExprVisitor} from './parser/expr';
import {MATHLIB_CALLABLES, MATHLIB_STATEMENTS} from './mathlib';
import {Parser} from './parser/parser';
import {Scanner} from './parser/scanner';
import {Stmt, AssignmentStmt, ConstStmt, ExpressionStmt, StmtVisitor} from './parser/stmt';
import {Token, TokenType} from './parser/token';

export class Interpreter implements ExprVisitor<any>, StmtVisitor<any> {
    private environment: Environment = new Environment();
    private errors: string[] = [];

    constructor() {
        this.createEnvironment();
    }

    createEnvironment() {
        MATHLIB_CALLABLES.forEach((callable, name) => this.environment.defineConstant(name, callable));
        this.run(MATHLIB_STATEMENTS);
    }

    run(source: string): string[] {
        this.errors = [];

        const scanner = new Scanner(source, this.scannerError.bind(this));
        const tokens = scanner.scanTokens();

        if (this.errors.length > 0) {
            return this.collectErrors();
        }

        const parser = new Parser(tokens, this.parserError.bind(this));
        const statements : Stmt[] = parser.parse();

        if (this.errors.length > 0) {
            return this.collectErrors();
        }

        const results: string[] = [];

        const astPrinter = new AstPrinter();
        statements.forEach((stmt) => results.push(astPrinter.print(stmt)));

        try {
            for (const statement of statements) {
                const ret = this.execute(statement);
                if (ret instanceof Callable) {
                    results.push('<native>');
                } else if (ret !== null) {
                    results.push(ret);
                }
            }
        } catch (e) {
            this.interpreterError(e);
        }

        if (this.errors.length > 0) {
            return results.concat(this.collectErrors());
        }
        
        return results;
    }

    execute(stmt: Stmt): any {
        return stmt.accept(this);
    }

    visitExpressionStmt(stmt: ExpressionStmt): any {
        return this.evaluate(stmt.expression);
    }

    visitAssignmentStmt(stmt: AssignmentStmt): any {
        const value = this.evaluate(stmt.expression);
        this.environment.define(stmt.name.lexeme, value);
        return value;
    }

    visitConstStmt(stmt: ConstStmt): any {
        const value = this.evaluate(stmt.expression);
        this.environment.defineConstant(stmt.name.lexeme, value);
        return value;
    }

    visitBinaryExpr(expr: BinaryExpr): any {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.MINUS:
                if (!this.ensureNumber(left, right)) {
                    return null;
                }
                return left - right;
            case TokenType.PLUS:
                if (!this.ensureNumber(left, right)) {
                    return null;
                }
                return left + right;
            case TokenType.SLASH:
                if (!this.ensureNumber(left, right)) {
                    return null;
                }
                return left / right;
            case TokenType.BACKSLASH:
                if (!this.ensureNumber(left, right)) {
                    return null;
                }
                return Math.floor(left / right);
            case TokenType.PERCENT:
                if (!this.ensureNumber(left, right)) {
                    return null;
                }
                return left % right;
            case TokenType.STAR:
                if (!this.ensureNumber(left, right)) {
                    return null;
                }
                return left * right;
            case TokenType.CARET:
                if (!this.ensureNumber(left, right)) {
                    return null;
                }
                return Math.pow(left, right);
            default:
                return this.unimplementedOperator(expr.operator.type);
        }
    }

    visitCallExpr(expr: CallExpr): any {
        const name = expr.name.lexeme;
        if (!this.environment.isDefined(name)) {
            return this.interpreterError(`Function "${name}" does not exist`);
        }

        const ref = this.environment.get(name);
        if (!(ref instanceof Callable)) {
            return this.interpreterError(`${name} is not a function`);
        }

        const fn = ref as Callable;
        const arity = fn.arity();
        const args = expr.args;

        if (args.length >= arity[0] && (arity.length == 1 || args.length <= arity[1])) {
            return fn.call(args.map(arg => this.evaluate(arg)));
        }
        return this.interpreterError(`Invalid number of arguments passed to function ${name}`);
    }

    visitGroupingExpr(expr: GroupingExpr): any {
        return this.evaluate(expr.expression);
    }

    visitLiteralExpr(expr: LiteralExpr): any {
        return expr.value;
    }

    visitUnaryExpr(expr: UnaryExpr): any {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.MINUS:
                return this.ensureNumber(right) ? -right : null;
            default:
                return this.unimplementedOperator(expr.operator.type);
        }
    }

    visitVariableExpr(expr: VariableExpr): any {
        return this.environment.get(expr.name.lexeme);
    }

    private evaluate(expr: Expr): any {
        return expr.accept(this);
    }

    private collectErrors(): string[] {
        console.log(this.errors);
        return this.errors;
    }

    private ensureNumber(...values: any[]): boolean {
        for (const value of values) {
            if (isNaN(value)) {
                this.errors.push(`'${value}' not a number`);
                return false;
            }
        }
        return true;
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

    private interpreterError(message: string) {
        this.errors.push(`Interpreter error: ${message}`);
    }
}