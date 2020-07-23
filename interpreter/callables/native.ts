import {Callable, CallableArity} from './callable';
import {Executor} from '../executor';
import {Value} from '../values/value';
import {NumberValue} from '../values/typed';

export class NativeCallable extends Callable {
    private readonly fn: Function;
    private readonly minArgs: number;
    private readonly maxArgs: number;

    constructor(fn: Function, minArgs: number = 1, maxArgs?: number) {
        super();

        this.fn = fn;
        this.minArgs = minArgs;
        this.maxArgs = maxArgs === undefined ? minArgs : maxArgs;
    }

    call(args: Value<any>[], _executor: Executor): Value<any> {
        const unboxed = args.map(arg => arg.assertNumber());
        return new NumberValue(this.fn(...unboxed));
    }

    arity(): CallableArity {
        return [this.minArgs, this.maxArgs];
    }

    toString(): string {
        return '<native>';
    }
}

export function __builtin__(fn: Function, minArgs: number = 1, maxArgs?: number): Callable {
    return new NativeCallable(fn, minArgs, maxArgs);
}