import {Callable, CallableArity} from './callable';
import {Environment} from '../environment';
import {ExpressionEvaluator} from '../expressionevaluator';
import {Expr} from '../parser/expr';
import {Token} from "../parser/token";
import {Value} from '../values/value';

export class FunctionCallable extends Callable {
    private readonly args: Token[];
    private readonly body: Expr;

    constructor(args: Token[], body: Expr) {
        super();
        this.args = args;
        this.body = body;
    }

    call(argsValues: Value<any>[], evaluator: ExpressionEvaluator): Value<any> {
        const env: Environment = new Environment(evaluator.environment());
        argsValues.forEach((value: Value<any>, index: number) => {
            env.define(this.args[index].lexeme, value);
        });
        return evaluator.evaluateWithEnvironment(this.body, env);
    }

    arity(): CallableArity {
        return [this.args.length, this.args.length];
    }

    toString(): string {
        return '<custom fn>';
    }
}