import {__builtin__} from './callables/native';

const MATHLIB = `
CONST PI = ${Math.PI}
CONST E = ${Math.E}

CONST SQRT(X) = X ^ (1 / 2)
`;

export const MATHLIB_STATEMENTS = MATHLIB.trim().replace(/\n+/g, ';');

export const MATHLIB_BUILTINS = new Map([
    ["SIN", __builtin__(Math.sin)],
    ["COS", __builtin__(Math.cos)],
    ["TAN", __builtin__(Math.tan)],
    ["RND", __builtin__(Math.random, 0)],
]);