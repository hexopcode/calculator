import {__builtin__} from './callables/native';

const MATHLIB = `
CONST PI = ${Math.PI}
CONST E = ${Math.E}

CONST ABS(X) = |X|
CONST FRAC(X) = X - FLOOR(X)
CONST FRAC2(X) = |X| - FLOOR(|X|)
CONST FRAC3(X) = X - INT(|X|) * SGN(X)
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
    ['RND', __builtin__(Math.random, 0)],
    ['SIN', __builtin__(Math.sin)],
    ['TAN', __builtin__(Math.tan)],
]);