import {ParserErrorReporter} from '../common/errorreporter';
import {Expr, BinaryExpr, FunctionExpr, GroupingExpr, LiteralExpr, ReferenceExpr, TernaryExpr, UnaryExpr, VariableExpr, CallExpr, LogicalExpr, AssignExpr} from './expr';
import {Token, TokenType} from './token';
import {Stmt, AssignmentStmt, ConstStmt, ExpressionStmt, ImportStmt, PragmaStmt} from './stmt';

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
                    this.match(TokenType.SEMI_COLON);
                }
            } catch (e) {
                break;
            }
        }
        return statements;
    }

    private declaration(): Stmt {
        if (this.match(TokenType.IMPORT)) {
            return this.importDeclaration();
        }
        if (this.match(TokenType.POUND)) {
            return this.pragmaDeclaration();
        }
        if (this.match(TokenType.CONST)) {
            return this.constantDeclaration();
        }
        if (this.match(TokenType.FN)) {
            return this.functionDeclaration();
        }
        if (this.check(TokenType.IDENTIFIER) && this.check(TokenType.EQUAL, 1)) {
            return this.assignmentDeclaration();
        }
        return this.expressionStatement();
    }

    private importDeclaration(): Stmt {
        const path = this.consume(TokenType.STRING, "Expect path after import keyword");
        return new ImportStmt(path);
    }

    private pragmaDeclaration(): Stmt {
        this.consume(TokenType.LEFT_SQUARE_BRACKET, 'Expect "[" after pragma');
        const name = this.consume(TokenType.IDENTIFIER, 'Expect pragma name');
        this.consume(TokenType.LEFT_PAREN, 'Expect "(" after pragma name');

        const attributes = new Map<Token, Token>();
        while (this.peek().type == TokenType.IDENTIFIER) {
            const key = this.advance();
            this.consume(TokenType.EQUAL, 'Expect "=" after pragma attribute name');
            
            const value = this.advance();
            if (value.type === TokenType.IDENTIFIER ||
                value.type === TokenType.NUMBER ||
                value.type === TokenType.FALSE ||
                value.type === TokenType.TRUE) {
                attributes.set(key, value);
            } else {
                this.error(value, 'Expected identifier, number, false, or true after attribute name');
            }

            if (this.peek().type !== TokenType.RIGHT_PAREN) {
                this.consume(TokenType.COMMA, 'Expect "," or ")" after pragma attribute');
            }
        }

        this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after pragma attributes');
        this.consume(TokenType.RIGHT_SQUARE_BRACKET, 'Expect "]" at the end of pragma');

        return new PragmaStmt(name, attributes);
    }

    private constantDeclaration(): Stmt {
        if (this.match(TokenType.FN)) {
            const name = this.consume(TokenType.IDENTIFIER, 'Expect constant name');
            this.consume(TokenType.LEFT_PAREN, 'Expect "(" after function name');
            const fn = this.functionExpr();
            return new ConstStmt(name, fn);
        }

        const name = this.consume(TokenType.IDENTIFIER, 'Expect constant name');
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
                this.peekAssert(TokenType.IDENTIFIER, 'Expect identifier after ","');
            }
        }
        this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after function arguments');
        this.consume(TokenType.EQUAL, 'Expect "=" after function signature');

        const expr = this.expression();
        if (this.match(TokenType.COMMA)) {
            return new FunctionExpr(args, expr, this.or());
        }

        return new FunctionExpr(args, expr);
    }

    private expression(): Expr {
        return this.assignment();
    }

    private assignment(): Expr {
        const expr = this.ternary();

        if (this.match(TokenType.EQUAL)) {
            const equals = this.previous();
            const value = this.assignment();

            if (expr instanceof VariableExpr) {
                return new AssignExpr(expr.name, value);
            }
            throw this.error(equals, 'Invalid assignment target');
        }

        return expr;
    }

    private ternary(): Expr {
        const expr = this.or();

        if (this.match(TokenType.QUESTION)) {
            const second = this.expression();
            this.consume(TokenType.COLON, 'Expect ":" after expression');
            const third = this.expression();
            return new TernaryExpr(expr, second, third);
        }

        return expr;
    }

    private or(): Expr {
        let expr = this.and();

        while (this.match(TokenType.PIPE_PIPE)) {
            const operator = this.previous();
            const right = this.and();
            expr = new LogicalExpr(expr, operator, right);
        }

        return expr;
    }

    private and(): Expr {
        let expr = this.equality();

        while (this.match(TokenType.AND_AND)) {
            const operator = this.previous();
            const right = this.equality();
            expr = new LogicalExpr(expr, operator, right);
        }

        return expr;
    }

    private equality(): Expr {
        let expr = this.comparison();

        while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
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
        let expr = this.primary();

        while (this.match(TokenType.LEFT_PAREN)) {
            expr = this.finishCall(expr);
        }
        return expr;
    }

    private finishCall(callee: Expr) {
        const args: Expr[] = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                args.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }

        this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after arguments');
        return new CallExpr(callee, args);
    }

    private primary(): Expr {
        if (this.match(TokenType.DOLLAR)) {
            return new ReferenceExpr(this.consume(TokenType.IDENTIFIER, 'Expect identifier after "$"'));
        } else if (this.match(TokenType.FALSE)) {
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

    private findFirst(type: TokenType, lookAhead: number = 0): number {
        for (let pos = this.current + lookAhead; pos < this.tokens.length; ++pos) {
            if (this.tokens[pos].type == type) {
                return pos;
            }
        }
        return -1;
    }

    private find(type: TokenType, lookAhead: number = 0): boolean {
        return this.findFirst(type, lookAhead) !== -1;
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
        const fullMessage = `${errorMessage} but found ${token.lexeme}`;
        this.errorReporter(token, fullMessage);
        return new Error(fullMessage);
    }
}