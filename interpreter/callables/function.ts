import {Callable, CallableArity} from './callable';
import {Environment} from '../environment';
import {Executor} from '../executor';
import {Expr} from '../parser/expr';
import {Token} from "../parser/token";

export class FunctionCallable extends Callable {
    private readonly args: Token[];
    private readonly body: Expr;

    constructor(args: Token[], body: Expr) {
        super();
        this.args = args;
        this.body = body;
    }

    call(argsValues: any[], executor: Executor): any {
        const env: Environment = new Environment(executor.environment());
        argsValues.forEach((value: any, index: number) => {
            env.define(this.args[index].lexeme, value);
        });
        return executor.evaluateWithEnvironment(this.body, env);
    }

    arity(): CallableArity {
        return [this.args.length, this.args.length];
    }

    toString(): string {
        return '<custom fn>';
    }
}