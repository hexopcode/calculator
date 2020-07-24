import {Callable, CallableArity} from './callable';
import {ExpressionEvaluator} from '../expressionevaluator';
import {Value} from '../values/value';
import {BooleanValue, NumberValue} from '../values/typed';

export abstract class NativeCallable extends Callable {
    protected readonly fn: Function;
    private readonly minArgs: number;
    private readonly maxArgs: number;

    constructor(fn: Function, minArgs: number = 1, maxArgs?: number) {
        super();

        this.fn = fn;
        this.minArgs = minArgs;
        this.maxArgs = maxArgs === undefined ? minArgs : maxArgs;
    }

    arity(): CallableArity {
        return [this.minArgs, this.maxArgs];
    }

    toString(): string {
        return '<native>';
    }
}

export class NumberNativeCallable extends NativeCallable {
    call(args: Value<any>[], _evaluator: ExpressionEvaluator): Value<any> {
        const unboxed = args.map(arg => arg.assertNumber());
        return new NumberValue(this.fn(...unboxed));
    }
}

export class BooleanNativeCallable extends NativeCallable {
    call(args: Value<any>[], _evaluator: ExpressionEvaluator): Value<any> {
        const unboxed = args.map(arg => arg.assertBoolean());
        return new BooleanValue(this.fn(...unboxed));
    }
}

export function __builtin__(fn: Function, minArgs: number = 1, maxArgs?: number): Callable {
    return new NumberNativeCallable(fn, minArgs, maxArgs);
}

export function __boolean_builtin__(fn: Function, minArgs: number = 1, maxArgs?: number): Callable {
    return new BooleanNativeCallable(fn, minArgs, maxArgs);
}

export function __raw_builtin__(fn: Function, minArgs: number = 1, maxArgs?: number): Callable {
    const raw = class extends NativeCallable {
        call(args: Value<any>[], _evaluator: ExpressionEvaluator): Value<any> {
            return this.fn(...args);
        }
    };

    return new raw(fn, minArgs, maxArgs);
}

export function __raw_builtin_env__(fn: Function, minArgs: number = 1, maxArgs?: number) : Callable {
    const raw = class extends NativeCallable {
        call(args: Value<any>[], evaluator: ExpressionEvaluator): Value<any> {
            return this.fn(evaluator.environment(), ...args);
        }
    };

    return new raw(fn, minArgs, maxArgs);
}