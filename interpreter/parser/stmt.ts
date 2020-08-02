import {Expr} from './expr';
import {Token} from './token';

export interface Stmt {
    accept<T>(visitor: StmtVisitor<T>): T;
}

export class ExpressionStmt implements Stmt {
    readonly expression: Expr;

    constructor(expression: Expr) {
        this.expression = expression;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitExpressionStmt(this);
    }
}

export class ConstStmt implements Stmt {
    readonly name: Token;
    readonly expression: Expr;

    constructor(name: Token, expression: Expr) {
        this.name = name;
        this.expression = expression;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitConstStmt(this);
    }
}

export class ImportStmt implements Stmt {
    readonly path: Token;

    constructor(path: Token) {
        this.path = path;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitImportStmt(this);
    }
}

export class PragmaStmt implements Stmt {
    readonly name: Token;
    readonly attributes: Map<Token, Token>;

    constructor(name: Token, attributes: Map<Token, Token>) {
        this.name = name;
        this.attributes = attributes;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitPragmaStmt(this);
    }
}

export interface StmtVisitor<T> {
    visitExpressionStmt(stmt: ExpressionStmt): T;
    visitConstStmt(stmt: ConstStmt): T;
    visitImportStmt(stmt: ImportStmt): T;
    visitPragmaStmt(stmt: PragmaStmt): T;
}