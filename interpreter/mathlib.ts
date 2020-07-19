import {Callable, CallableArity} from './callable';
import {Executor} from './executor';

function __builtin__(fn: Function, minArgs: number = 1, maxArgs?: number): Callable {
    return new class extends Callable {
        call(args: any[], _xecutor: Executor): any {
            return fn(...args);
        }

        arity(): CallableArity {
            return [minArgs, maxArgs === undefined ? minArgs : maxArgs];
        }
    }
}

const MATHLIB = `
CONST PI = ${Math.PI}
CONST E = ${Math.E}
`;

export const MATHLIB_STATEMENTS = MATHLIB.trim().replace('\n', ':');

export const MATHLIB_CALLABLES = new Map([
    ["SIN", __builtin__(Math.sin)],
    ["COS", __builtin__(Math.cos)],
    ["TAN", __builtin__(Math.tan)],
    ["RND", __builtin__(Math.random, 0)],
]);