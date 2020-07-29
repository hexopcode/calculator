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
    DOLLAR,
    
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
    FN,
    FALSE,
    IMPORT,
    TRUE,

    EOF,
}

export class Token {
    readonly type: TokenType;
    readonly lexeme: string;
    readonly literal: any;
    readonly line: number;
    readonly column: number;

    constructor(type: TokenType, lexeme: string, literal: any, line: number, column: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
        this.column = column;
    }

    toString(): string {
        return `${this.type} ${this.lexeme} ${this.literal} ${this.line} ${this.column}`;
    }
}