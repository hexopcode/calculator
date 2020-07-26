import {ScannerErrorReporter} from '../common/errorreporter';
import {Token, TokenType} from './token';

const KEYWORDS: Map<string, TokenType> = new Map([
    ['CONST', TokenType.CONST],
    ['FN', TokenType.FN],
    ['FALSE', TokenType.FALSE],
    ['TRUE', TokenType.TRUE],
]);

export class Scanner {
    private expression: string;
    private errorReporter: (message: string) => void;
    private tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;

    constructor(expression: string, errorReporter: ScannerErrorReporter) {
        this.expression = expression;
        this.errorReporter = (message: string) => errorReporter(this.current - 1, message);
    }

    scanTokens(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, '', null));
        return this.tokens;
    }

    private isAtEnd(): boolean {
        return this.current >= this.expression.length;
    }

    private scanToken() {
        const c = this.advance();
        switch (c) {
            case '#':
                while (!this.match('\n') || this.match('\r')) {
                    this.advance();
                }
                break;
            case ':':
                this.addToken(TokenType.COLON);
                break;
            case ';':
                this.addToken(TokenType.SEMI_COLON);
                break;
            case ',':
                this.addToken(TokenType.COMMA);
                break;
            case '?':
                this.addToken(TokenType.QUESTION);
                break;
            case '(':
                this.addToken(TokenType.LEFT_PAREN);
                break;
            case ')':
                this.addToken(TokenType.RIGHT_PAREN);
                break;
            case '[':
                this.addToken(TokenType.LEFT_SQUARE_BRACKET);
                break;
            case ']':
                this.addToken(TokenType.RIGHT_SQUARE_BRACKET);
                break;
            case '.':
                this.addToken(TokenType.DOT);
                break;
            case '-':
                this.addToken(TokenType.MINUS);
                break;
            case '+':
                this.addToken(TokenType.PLUS);
                break;
            case '/':
                this.addToken(TokenType.SLASH);
                break;
            case '\\':
                this.addToken(TokenType.BACKSLASH);
                 break;
            case '%':
                this.addToken(TokenType.PERCENT);
                break;
            case '*':
                this.addToken(TokenType.STAR);
                break;
            case '^':
                this.addToken(TokenType.CARET);
                break;
            
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '|':
                this.addToken(this.match('|') ? TokenType.PIPE_PIPE : TokenType.PIPE);
                break;
            case '&':
                if (this.match('&')) {
                    this.addToken(TokenType.AND_AND);
                } else {
                    this.errorReporter('Unexpected character');
                }
                break;
            case '$':
                if (this.isAlpha(this.peek())) {
                    this.addToken(TokenType.DOLLAR);
                } else {
                    this.errorReporter('Unexpected character');
                }
            case ' ':
            case '\r':
            case '\n':
            case '\t':
                break;
            case '"':
                this.string();
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    this.errorReporter('Unexpected character');
                }
                break;
        }
    }

    private advance(): string {
        this.current++;
        return this.expression.charAt(this.current - 1);
    }

    private addToken(type: TokenType, literal: any = null) {
        const text = this.expression.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal));
    }

    private match(expected: string): boolean {
        if (this.isAtEnd() || this.expression.charAt(this.current) != expected) {
            return false;
        }
        this.current++;
        return true;
    }

    private peek(howFar: number = 0): string {
        if (this.current + howFar >= this.expression.length) {
            return '\0';
        }
        return this.expression.charAt(this.current + howFar);
    }

    private string() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            this.advance();
        }

        if (this.isAtEnd()) {
            this.errorReporter('Unterminated string');
            return;
        }

        this.advance();  // the closing "

        const value = this.expression.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private isDigit(c: string): boolean {
        const cc = c.charCodeAt(0);
        return cc >= '0'.charCodeAt(0) && cc <= '9'.charCodeAt(0);
    }

    private isBinaryDigit(c: string): boolean {
        return c == '0' || c == '1';
    }

    private isOctalDigit(c: string): boolean {
        const cc = c.charCodeAt(0);
        return cc >= '0'.charCodeAt(0) && cc <= '7'.charCodeAt(0);
    }

    private isHexDigit(c: string): boolean {
        const cc = c.charCodeAt(0);
        return (cc >= '0'.charCodeAt(0) && cc <= '9'.charCodeAt(0)) ||
            (cc >= 'a'.charCodeAt(0) && cc <= 'f'.charCodeAt(0)) ||
            (cc >= 'A'.charCodeAt(0) && cc <= 'F'.charCodeAt(0));
    }

    private number() {
        if (this.peek(-1) == '0') {
            switch (this.peek()) {
                case 'b':
                case 'B':
                    this.advance();
                    while (this.isBinaryDigit(this.peek())) {
                        this.advance();
                    }
                    this.addToken(
                        TokenType.NUMBER,
                        parseInt(this.expression.substring(this.start + 2, this.current), 2));
                    return;

                case 'o':
                case 'O':
                    this.advance();
                    while (this.isOctalDigit(this.peek())) {
                        this.advance();
                    }
                    this.addToken(
                        TokenType.NUMBER,
                        parseInt(this.expression.substring(this.start + 2, this.current), 8));
                    return;

                case 'x':
                case 'X':
                    this.advance();
                    while (this.isHexDigit(this.peek())) {
                        this.advance();
                    }
                    this.addToken(
                        TokenType.NUMBER,
                        parseInt(this.expression.substring(this.start + 2, this.current), 16));
                    return;
            }
        }

        while (this.isDigit(this.peek())) {
            this.advance();
        }

        if (this.peek() == '.' && this.isDigit(this.peek(1))) {
            this.advance();
        }

        while (this.isDigit(this.peek())) {
            this.advance();
        }

        this.addToken(
            TokenType.NUMBER,
            parseFloat(this.expression.substring(this.start, this.current)));
    }

    private isAlpha(c: string): boolean {
        const cc = c.charCodeAt(0);
        return (cc >= 'a'.charCodeAt(0) && cc <= 'z'.charCodeAt(0)) ||
            (cc >= 'A'.charCodeAt(0) && cc <= 'Z'.charCodeAt(0)) ||
            c == '_';
    }

    private isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }

    private identifier() {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }

        const text = this.expression.substring(this.start, this.current);
        if (KEYWORDS.has(text)) {
            this.addToken(KEYWORDS.get(text));
        } else {
            this.addToken(TokenType.IDENTIFIER);
        }
    }
}