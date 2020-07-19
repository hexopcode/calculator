import {Callable, CallableArity} from './callable';
import {Executor} from '../executor';

export function __builtin__(fn: Function, minArgs: number = 1, maxArgs?: number): Callable {
    return new class extends Callable {
        call(args: any[], _xecutor: Executor): any {
            return fn(...args);
        }

        arity(): CallableArity {
            return [minArgs, maxArgs === undefined ? minArgs : maxArgs];
        }

        toString(): string {
            return '<native>';
        }
    }
}