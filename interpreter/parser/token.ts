export enum TokenType {
    // single char
    COLON,
    SEMI_COLON,
    COMMA,
    QUESTION,
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
    PIPE,
    PIPE_PIPE,
    AND_AND,

    // literals
    IDENTIFIER,
    STRING,
    NUMBER,

    // keywords
    CONST,
    FALSE,
    TRUE,

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