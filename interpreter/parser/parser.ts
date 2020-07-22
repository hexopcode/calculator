import {ParserErrorReporter} from '../common/errorreporter';
import {Expr, BinaryExpr, FunctionExpr, GroupingExpr, LiteralExpr, TernaryExpr, UnaryExpr, VariableExpr, CallExpr} from './expr';
import {Token, TokenType} from './token';
import {Stmt, AssignmentStmt, ConstStmt, ExpressionStmt} from './stmt';

export class Parser {
    private tokens: Token[];
    private errorReporter: ParserErrorReporter;
    private current: number = 0;

    constructor(tokens: Token[], errorReporter: ParserErrorReporter) {
        this.tokens = tokens;
        this.errorReporter = errorReporter;
    }

    parse(): Stmt[] {
        const statements: Stmt[] = [];
        while (!this.isAtEnd()) {
            try {
                statements.push(this.declaration());
                if (!this.isAtEnd()) {
                    this.consume(TokenType.SEMI_COLON, 'Expect ";" after statement');
                }
            } catch (e) {
                break;
            }
        }
        return statements;
    }

    private declaration(): Stmt {
        if (this.match(TokenType.CONST)) {
            return this.constantDeclaration();
        }
        if (this.check(TokenType.IDENTIFIER) && this.check(TokenType.LEFT_PAREN, 1) && this.find(TokenType.EQUAL)) {
            return this.functionDeclaration();
        }
        if (this.check(TokenType.IDENTIFIER) && this.check(TokenType.EQUAL, 1)) {
            return this.assignmentDeclaration();
        }
        return this.expressionStatement();
    }

    private constantDeclaration(): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect constant name');

        if (this.match(TokenType.LEFT_PAREN)) {
            const fn = this.functionExpr();
            return new ConstStmt(name, fn);
        }

        this.consume(TokenType.EQUAL, 'Expect "=" after identifier');
        const expr = this.expression();

        return new ConstStmt(name, expr);
    }

    private functionDeclaration(): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect function name');
        this.consume(TokenType.LEFT_PAREN, 'Expect "(" after function name');
        const fn = this.functionExpr();

        return new AssignmentStmt(name, fn);
    }

    private assignmentDeclaration(): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name');
        this.consume(TokenType.EQUAL, 'Expect "=" after identifier');
        const expr = this.expression();

        return new AssignmentStmt(name, expr);
    }

    private expressionStatement(): Stmt {
        return new ExpressionStmt(this.expression());
    }

    private functionExpr(): Expr {
        const args: Token[] = [];

        while (this.peek().type == TokenType.IDENTIFIER) {
            args.push(this.advance());
            if (this.peek().type != TokenType.RIGHT_PAREN) {
                this.consume(TokenType.COMMA, 'Expect "," after identifier');
                this.peekAssert(TokenType.IDENTIFIER, 'Expect idenfier after ","');
            }
        }
        this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after function arguments');
        this.consume(TokenType.EQUAL, 'Expect "=" after function signature');

        return new FunctionExpr(args, this.expression());
    }

    private expression(): Expr {
        return this.equality();
    }

    private equality(): Expr {
        let expr = this.comparison();

        if (this.match(TokenType.QUESTION)) {
            const second = this.expression();
            this.consume(TokenType.COLON, 'Expect ":" after expression');
            const third = this.expression();
            return new TernaryExpr(expr, second, third);
        }

        while (this.match(TokenType.EQUAL, TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private comparison(): Expr {
        let expr = this.addition();

        while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            const operator = this.previous();
            const right = this.addition();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private addition(): Expr {
        let expr = this.multiplication();

        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
            const operator = this.previous();
            const right = this.multiplication();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private multiplication(): Expr {
        let expr = this.exponential();

        while (this.match(TokenType.SLASH, TokenType.BACKSLASH, TokenType.PERCENT, TokenType.STAR)) {
            const operator = this.previous();
            const right = this.exponential();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private exponential(): Expr {
        let expr = this.unary();

        while (this.match(TokenType.CARET)) {
            const operator = this.previous();
            const right = this.unary();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private unary(): Expr {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.unary();
            return new UnaryExpr(operator, right);
        } else if (this.match(TokenType.PIPE)) {
            const operator = this.previous();
            const right = this.expression();
            this.consume(TokenType.PIPE, 'Expect "|" after expression');
            return new UnaryExpr(operator, right);
        }

        return this.call();
    }

    private call(): Expr {
        const token: Token = this.peek();
        const expr: Expr = this.primary();

        if (token.type == TokenType.IDENTIFIER && this.match(TokenType.LEFT_PAREN)) {
            const args: Expr[] = [];
            if (!this.match(TokenType.RIGHT_PAREN)) {
                do {
                    args.push(this.expression());
                } while (this.match(TokenType.COMMA));

                this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after arguments');
            }
            return new CallExpr(token, args);
        }

        return expr;
    }

    private primary(): Expr {
        if (this.match(TokenType.FALSE)) {
            return new LiteralExpr(false);
        } else if (this.match(TokenType.TRUE)) {
            return new LiteralExpr(true);
        } else if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new LiteralExpr(this.previous().literal);
        } else if (this.match(TokenType.IDENTIFIER)) {
            return new VariableExpr(this.previous());
        } else if (this.match(TokenType.LEFT_PAREN)) {
            const expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after expression');
            return new GroupingExpr(expr);
        }
        throw this.error(this.peek(), 'Expect expression');
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private find(type: TokenType, lookAhead: number = 0): boolean {
        for (let pos = this.current + lookAhead; pos < this.tokens.length; ++pos) {
            if (this.tokens[pos].type == type) {
                return true;
            }
        }
        return false;
    }

    private check(type: TokenType, lookAhead: number = 0): boolean {
        if (this.isAtEnd()) {
            return false;
        }
        if (this.current + lookAhead >= this.tokens.length) {
            return false;
        }

        return this.peek(lookAhead).type == type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) {
            this.current++;
        }
        return this.previous();
    }

    isAtEnd(): boolean {
        return this.peek().type == TokenType.EOF;
    }

    peek(lookAhead: number = 0): Token {
        return this.tokens[this.current + lookAhead];
    }

    previous(): Token {
        return this.tokens[this.current - 1];
    }

    peekAssert(type: TokenType, errorMessage: string): Token {
        if (this.peek().type != type) {
            throw this.error(this.peek(), errorMessage);
        }
        return this.peek();
    }

    consume(type: TokenType, errorMessage: string): Token {
        if (this.check(type)) {
            return this.advance();
        }

        throw this.error(this.peek(), errorMessage);
    }

    error(token: Token, errorMessage: string): Error {
        this.errorReporter(token, errorMessage);
        return new Error(`${errorMessage} but found ${token.lexeme}`);
    }
}