import {Expr, AssignExpr, BinaryExpr, CallExpr, TernaryExpr, FunctionExpr, GroupingExpr, LiteralExpr, LogicalExpr, ReferenceExpr, UnaryExpr, VariableExpr, ExprVisitor} from './parser/expr';
import {Stmt, AssignmentStmt, ConstStmt, ExpressionStmt, ImportStmt, StmtVisitor} from './parser/stmt';
import {TokenType} from './parser/token';

export class AstPrinter implements ExprVisitor<string>, StmtVisitor<string> {
    print(stmt: Stmt): string {
        return stmt.accept(this);
    }

    visitExpressionStmt(stmt: ExpressionStmt): string {
        return this.parenthesize('expr', stmt.expression);
    }

    visitAssignmentStmt(stmt: AssignmentStmt): string {
        return this.parenthesize(`= ${stmt.name.lexeme}`, stmt.expression);
    }

    visitConstStmt(stmt: ConstStmt): string {
        return this.parenthesize(`const ${stmt.name.lexeme}`, stmt.expression);
    }

    visitImportStmt(stmt: ImportStmt): string {
        return this.parenthesize(`import ${stmt.path.literal}`);
    }

    visitAssignExpr(expr: AssignExpr): string {
        return this.parenthesize(`= ${expr.name.lexeme}`, expr.value);
    }

    visitBinaryExpr(expr: BinaryExpr): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    visitTernaryExpr(expr: TernaryExpr): string {
        return this.parenthesize('?:', expr.first, expr.second, expr.third);
    }

    visitCallExpr(expr: CallExpr): string {
        return this.parenthesize('call', expr.callee, ...expr.args);
    }

    visitFunctionExpr(expr: FunctionExpr): string {
        const args = expr.args.map(arg => arg.lexeme).join(' ');
        return expr.cond ?
            this.parenthesize(`fn (${args})`, expr.body, expr.cond) :
            this.parenthesize(`fn (${args})`, expr.body);
    }

    visitGroupingExpr(expr: GroupingExpr): string {
        return this.parenthesize('group', expr.expression);
    }

    visitLiteralExpr(expr: LiteralExpr): string {
        if (expr.value == null) {
            return 'nil';
        }
        return expr.value.toString();
    }

    visitLogicalExpr(expr: LogicalExpr): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    visitReferenceExpr(expr: ReferenceExpr): string {
        return this.parenthesize(`ref ${expr.ref.lexeme}`);
    }

    visitUnaryExpr(expr: UnaryExpr): string {
        return expr.operator.type == TokenType.PIPE ?
            this.parenthesize('ABS', expr.right) :
            this.parenthesize(expr.operator.lexeme, expr.right);
    }

    visitVariableExpr(expr: VariableExpr): string {
        return expr.name.lexeme;
    }

    private parenthesize(name: string, ...expressions: Expr[]): string {
        let str = `(${name}`;
        for (const expr of expressions) {
            str += ` ${expr.accept(this)}`;
        }
        return str + ')';
    }
}