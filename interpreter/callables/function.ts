import {CALL_ASSERT_FALSE} from '../passes/partialcallables';
import {Callable, CallableArity} from './callable';
import {Environment} from '../environment';
import {ExpressionEvaluator} from '../expressionevaluator';
import {TernaryExpr} from '../parser/expr';
import {Token} from "../parser/token";
import {Value} from '../values/value';

export class FunctionCallable extends Callable {
    private readonly args: Token[];
    private readonly destructured: boolean;
    private readonly body: TernaryExpr;

    constructor(args: Token[], destructured: boolean, body: TernaryExpr) {
        super();
        this.args = args;
        this.destructured = destructured;
        this.body = body;
    }

    call(argsValues: Value<any>[], evaluator: ExpressionEvaluator): Value<any> {
        const env: Environment = new Environment(evaluator.environment());
        const values = this.destructured ? (argsValues[0].value() as Array<Value<any>>) : argsValues;
        values.forEach((value: Value<any>, index: number) => {
            env.define(this.args[index].lexeme, value);
        });
        return evaluator.evaluateWithEnvironment(this.body, env);
    }

    arity(): CallableArity {
        return this.destructured ? [1, 1] : [this.args.length, this.args.length];
    }

    toString(): string {
        return '<CUSTOM FN>';
    }

    concat(callable: FunctionCallable) {
        let leafTernary = this.body;
        while (leafTernary.third instanceof TernaryExpr) {
            leafTernary = leafTernary.third;
        }

        if (leafTernary.third === CALL_ASSERT_FALSE) {
            leafTernary.third = callable.body;
        } else {
            throw new Error('Cannot add partial function to non-partial function');
        }
    }
}