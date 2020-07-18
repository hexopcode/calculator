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

export class AssignmentStmt implements Stmt {
    readonly name: Token;
    readonly expression: Expr;

    constructor(name: Token, expression: Expr) {
        this.name = name;
        this.expression = expression;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitAssignmentStmt(this);
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

export interface StmtVisitor<T> {
    visitExpressionStmt(stmt: ExpressionStmt): T;
    visitAssignmentStmt(stmt: AssignmentStmt): T;
    visitConstStmt(stmt: ConstStmt): T;
}