import {__builtin__} from './callables/native';

const MATHLIB = `
CONST E = ${Math.E}
CONST PI = ${Math.PI}

CONST SQRT(X) = X ^ (1 / 2)
CONST ROOT(X, Y) = X < 0 ? -(-X ^ (1 / Y)) : X ^ (1 / Y)

CONST EXP(X) = E ^ X
CONST LOGN(X, N) = LOG(X) / LOG(N)
CONST LOG10(X) = LOGN(X, 10)
CONST LOG2(X) = LOGN(X, 2)

CONST ABS(X) = |X|
CONST SGN(X) = X > 0 ? 1 : X < 0 ? -1 : 0
CONST TRUNC(X) = INT(X)
CONST FRAC(X) = X - FLOOR(X)
CONST FRAC2(X) = |X| - FLOOR(|X|)
CONST FRAC3(X) = X - INT(|X|) * SGN(X)

CONST MAX(X, Y) = X > Y ? X : Y
CONST MIN(X, Y) = X < Y ? X : Y

CONST COT(X) = 1 / TAN(X)
CONST SEC(X) = 1 / COS(X)
CONST CSEC(X) = 1 / SIN(X)

CONST SINH(X) = (1 - EXP(-2 * X)) / (2 * EXP(-X))
CONST COSH(X) = (1 + EXP(-2 * X)) / (2 * EXP(-X))
CONST TANH(X) = (EXP(2 * X) - 1) / (EXP(2 * X) + 1)
CONST COTH(X) = (EXP(2 * X) + 1) / (EXP(2 * X) - 1)
CONST SECH(X) = (2 * EXP(X)) / (EXP(2 * X) + 1)
CONST CSECH(X) = (2 * EXP(X)) / (EXP(2 * X) - 1)

CONST ASINH(X) = LOG(X + SQRT(X * X + 1))
CONST ACOSH(X) = LOG(X + SQRT(X * X - 1))
CONST ATANH(X) = LOG((1 + X) / (1 - X)) / 2
CONST ACOTH(X) = LOG((X + 1) / (X - 1)) / 2
CONST ASECH(X) = LOG((1 + SQRT(1 - X ^ 2)) / X)
CONST ACSECH(X) = LOG((1 / 2) + SQRT((1 / (X ^ 2)) + 1))

CONST HYPOT(X, Y) = SQRT(X ^ 2 + Y ^ 2)
CONST FAC(X) = X == 0 ? 1 : X * FAC(X - 1)
`;

export const MATHLIB_STATEMENTS = MATHLIB.trim().replace(/\n+/g, ';');

export const MATHLIB_BUILTINS = new Map([
    ['SIN', __builtin__(Math.sin)],
    ['COS', __builtin__(Math.cos)],
    ['TAN', __builtin__(Math.tan)],
    ['ASIN', __builtin__(Math.asin)],
    ['ACOS', __builtin__(Math.acos)],
    ['ATAN', __builtin__(Math.atan)],

    ['CEIL', __builtin__(Math.ceil)],
    ['FLOOR', __builtin__(Math.floor)],
    ['INT', __builtin__(Math.trunc)],

    ['LOG', __builtin__(Math.log)],
    ['RND', __builtin__(Math.random, 0)],
]);