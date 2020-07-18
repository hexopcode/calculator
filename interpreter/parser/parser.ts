import {ParserErrorReporter} from '../common/errorreporter';
import {Expr, BinaryExpr, GroupingExpr, LiteralExpr, VariableExpr, UnaryExpr, CallExpr} from './expr';
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
            statements.push(this.declaration());
        }

        return statements;
    }

    private declaration(): Stmt {
        try {
            if (this.match(TokenType.CONST)) {
                return this.constantDeclaration();
            }
            if (this.check(TokenType.IDENTIFIER) && this.check(TokenType.EQUAL, 1)) {
                return this.assignmentDeclaration();
            }
            return this.statement();
        } catch (e) {
            return null;
        }
    }

    private constantDeclaration(): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect constant name');
        this.consume(TokenType.EQUAL, 'Expect "=" after identifier');
        const expr = this.expression();

        if (!this.isAtEnd()) {
            this.consume(TokenType.COLON, 'Expect ":" after constant declaration');
        }

        return new ConstStmt(name, expr);
    }

    private assignmentDeclaration(): Stmt {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name');
        this.consume(TokenType.EQUAL, 'Expect "=" after identifier');
        const expr = this.expression();

        if (!this.isAtEnd()) {
            this.consume(TokenType.COLON, 'Expect ":" after assignment declaration');
        }

        return new AssignmentStmt(name, expr);
    }

    private statement(): Stmt {
        return this.expressionStatement();
    }

    private expressionStatement(): Stmt {
        const expr = this.expression();
        if (!this.isAtEnd()) {
            this.consume(TokenType.COLON, 'Expect ":" after expression');
        }
        return new ExpressionStmt(expr);
    }

    private expression(): Expr {
        return this.equality();
    }

    private equality(): Expr {
        let expr = this.comparison();

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
        // TODO: symbols

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new LiteralExpr(this.previous().literal);
        }

        if (this.match(TokenType.IDENTIFIER)) {
            return new VariableExpr(this.previous());
        }

        if (this.match(TokenType.LEFT_PAREN)) {
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

    consume(type: TokenType, errorMessage: string): Token {
        if (this.check(type)) {
            return this.advance();
        }

        throw this.error(this.peek(), errorMessage);
    }

    error(token: Token, errorMessage: string): Error {
        this.errorReporter(token, errorMessage);
        return new Error(errorMessage);
    }
}