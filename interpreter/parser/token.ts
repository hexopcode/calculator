export enum TokenType {
    // single char
    COLON,
    COMMA,
    LEFT_PAREN,
    RIGHT_PAREN,
    LEFT_SQUARE_BRACKET,
    RIGHT_SQUARE_BRACKET,
    DOT,
    MINUS,
    PLUS,
    SLASH,
    BACKSLASH,
    PERCENT,
    STAR,
    CARET,
    PIPE,
    POUND,
    
    // one or two chars
    BANG,
    BANG_EQUAL,
    EQUAL,
    EQUAL_EQUAL,
    GREATER,
    GREATER_EQUAL,
    LESS,
    LESS_EQUAL,

    // literals
    IDENTIFIER,
    STRING,
    NUMBER,

    // keywords
    CONST,

    EOF,
}

export class Token {
    readonly type: TokenType;
    readonly lexeme: string;
    readonly literal: any;

    constructor(type: TokenType, lexeme: string, literal: any) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
    }

    toString(): string {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}