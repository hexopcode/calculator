import {Callable, CallableArity} from './callable';
import {Executor} from '../executor';
import {Value} from '../values/value';
import {NumberValue} from '../values/typed';

export function __builtin__(fn: Function, minArgs: number = 1, maxArgs?: number): Callable {
    return new class extends Callable {
        call(args: Value<any>[], _xecutor: Executor): Value<any> {
            const unboxed = args.map(arg => arg.assertNumber());
            return new NumberValue(fn(...unboxed));
        }

        arity(): CallableArity {
            return [minArgs, maxArgs === undefined ? minArgs : maxArgs];
        }

        toString(): string {
            return '<native>';
        }
    }
}