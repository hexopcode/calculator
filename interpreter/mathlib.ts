import {__builtin__} from './callables/native';

const MATHLIB = `
CONST E = ${Math.E}
CONST PI = ${Math.PI}

CONST ABS(X) = |X|
CONST EXP(X) = E ^ X
CONST FRAC(X) = X - FLOOR(X)
CONST FRAC2(X) = |X| - FLOOR(|X|)
CONST FRAC3(X) = X - INT(|X|) * SGN(X)
CONST LOGN(X, N) = LOG(X) / LOG(N)
CONST LOG10(X) = LOGN(X, 10)
CONST LOG2(X) = LOGN(X, 2)
CONST ROOT(X, Y) = X < 0 ? -(-X ^ (1 / Y)) : X ^ (1 / Y)
CONST SGN(X) = X > 0 ? 1 : X < 0 ? -1 : 0
CONST SQRT(X) = X ^ (1 / 2)
CONST TRUNC(X) = INT(X)
`

export const MATHLIB_STATEMENTS = MATHLIB.trim().replace(/\n+/g, ';');

export const MATHLIB_BUILTINS = new Map([
    ['CEIL', __builtin__(Math.ceil)],
    ['COS', __builtin__(Math.cos)],
    ['FLOOR', __builtin__(Math.floor)],
    ['INT', __builtin__(Math.trunc)],
    ['LOG', __builtin__(Math.log)],
    ['RND', __builtin__(Math.random, 0)],
    ['SIN', __builtin__(Math.sin)],
    ['TAN', __builtin__(Math.tan)],
]);