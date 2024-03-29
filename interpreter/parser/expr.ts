import {Token} from './token';

export interface Expr {
    accept<T>(visitor: ExprVisitor<T>): T;
}

export class AssignExpr implements Expr {
    readonly name: Token;
    readonly value: Expr;
    readonly isConst: boolean;

    constructor(name: Token, value: Expr, isConst: boolean) {
        this.name = name;
        this.value = value;
        this.isConst = isConst;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitAssignExpr(this);
    }
}

export class BinaryExpr implements Expr {
    readonly left: Expr;
    readonly operator: Token;
    readonly right: Expr;

    constructor(left: Expr, operator: Token, right: Expr) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitBinaryExpr(this);
    }
}

export class TernaryExpr implements Expr {
    readonly first: Expr;
    readonly second: Expr;
    /* mutable */ third: Expr;

    constructor(first: Expr, second: Expr, third: Expr) {
        this.first = first;
        this.second = second;
        this.third = third;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitTernaryExpr(this);
    }
}

export class CallExpr implements Expr {
    readonly callee: Expr;
    readonly args: Expr[];

    constructor(callee: Expr, args: Expr[]) {
        this.callee = callee;
        this.args = args;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitCallExpr(this);
    }
}

export class FunctionExpr implements Expr {
    readonly args: Token[];
    readonly body: Expr;
    readonly destructured: boolean;
    readonly cond?: Expr;

    constructor(args: Token[], body: Expr, destructured: boolean, cond?: Expr) {
        this.args = args;
        this.body = body;
        this.destructured = destructured;
        this.cond = cond;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitFunctionExpr(this);
    }
}

export class GroupingExpr implements Expr {
    readonly expression: Expr;

    constructor(expression: Expr) {
        this.expression = expression;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitGroupingExpr(this);
    }
}

export class LiteralExpr implements Expr {
    readonly value: any;

    constructor(value: any) {
        this.value = value;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitLiteralExpr(this);
    }
}

export class LogicalExpr implements Expr {
    readonly left: Expr;
    readonly operator: Token;
    readonly right: Expr;

    constructor(left: Expr, operator: Token, right: Expr) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitLogicalExpr(this);
    }
}

export class ReferenceExpr implements Expr {
    readonly ref: Token;

    constructor(ref: Token) {
        this.ref = ref;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitReferenceExpr(this);
    }
}

export class UnaryExpr implements Expr {
    readonly operator: Token;
    readonly right: Expr;

    constructor(operator: Token, right: Expr) {
        this.operator = operator;
        this.right = right;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitUnaryExpr(this);
    }
}

export class VariableExpr implements Expr {
    readonly name: Token;

    constructor(name: Token) {
        this.name = name;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitVariableExpr(this);
    }
}

export class VectorExpr implements Expr {
    readonly elements: Array<Expr>;

    constructor(elements: Array<Expr>) {
        this.elements = elements;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitVectorExpr(this);
    }
}

export class WithExpr implements Expr {
    readonly locals: AssignExpr[];
    readonly expr: Expr;

    constructor(locals: AssignExpr[], expr: Expr) {
        this.locals = locals;
        this.expr = expr;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitWithExpr(this);
    }
}

export interface ExprVisitor<T> {
    visitAssignExpr(expr: AssignExpr): T;
    visitBinaryExpr(expr: BinaryExpr): T;
    visitTernaryExpr(expr: TernaryExpr): T;
    visitCallExpr(expr: CallExpr): T;
    visitFunctionExpr(expr: FunctionExpr): T;
    visitGroupingExpr(expr: GroupingExpr): T;
    visitLiteralExpr(expr: LiteralExpr): T;
    visitLogicalExpr(expr: LogicalExpr): T;
    visitReferenceExpr(expr: ReferenceExpr): T;
    visitUnaryExpr(expr: UnaryExpr): T;
    visitVariableExpr(expr: VariableExpr): T;
    visitVectorExpr(expr: VectorExpr): T;
    visitWithExpr(expr: WithExpr): T;
}