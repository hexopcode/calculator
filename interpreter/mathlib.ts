import {__builtin__, __raw_builtin__, __raw_builtin_env__} from './callables/native';
import {Environment} from './environment';
import {NumberValue, ReferenceValue, StringValue} from './values/typed';
import {Value} from './values/value';

const MATHLIB = `
CONST ISTYPE(X, T) = TYPE(X) == T
CONST ISBOOL(X) = ISTYPE(X, "BOOL")
CONST ISNUM(X) = ISTYPE(X, "NUM")
CONST ISSTR(X) = ISTYPE(X, "STR")
CONST ISFN(X) = ISTYPE(X, "FN")
CONST ISREF(X) = ISTYPE(X, "REF")

CONST ASSERTBOOL(X) = ASSERT(ISBOOL(X), "NOT A BOOL")
CONST ASSERTNUM(X) = ASSERT(ISNUM(X), "NOT A NUM")
CONST ASSERTSTR(X) = ASSERT(ISSTR(X), "NOT A STR")
CONST ASSERTFN(X) = ASSERT(ISFN(X), "NOT AN FN")

BOOL(X) = X, ISBOOL(X)
BOOL(X) = X == 0 ? FALSE : TRUE, ISNUM(X)
BOOL(X) = X == "" ? FALSE : TRUE, ISSTR(X)
BOOL(X) = TRUE, ISFN(X)
BOOL(X) = TRUE, ISREF(X)
FREEZE($BOOL)

CONST E = 2.718281828459045
CONST PI = 3.141592653589793

CONST RNDRANGE(X, Y) = RND() * (Y - X) + X
CONST RNDRANGEINT(X, Y) = FLOOR(RND() * (FLOOR(Y) - CEIL(X))) + CEIL(X)

CONST SQRT(X) = X ^ (1 / 2)

ROOT(X, Y) = -(-X ^ (1 / Y)), X < 0
ROOT(X, Y) = X ^ (1 / Y)
FREEZE($ROOT)

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
CONST FIB(X) = X == 0 ? 0 : X < 3 ? 1 : FIB(X - 1) + FIB(X - 2)
`;

export const MATHLIB_STATEMENTS = MATHLIB.trim().replace(/\n+/g, ';');

export const MATHLIB_BUILTINS = new Map([
    ['SIN', __builtin__(Math.sin)],
    ['COS', __builtin__(Math.cos)],
    ['TAN', __builtin__(Math.tan)],
    ['ASIN', __builtin__(Math.asin)],
    ['ACOS', __builtin__(Math.acos)],
    ['ATAN', __builtin__(Math.atan)],
    ['ATAN2', __builtin__(Math.atan2, 2)],

    ['CEIL', __builtin__(Math.ceil)],
    ['FLOOR', __builtin__(Math.floor)],
    ['INT', __builtin__(Math.trunc)],

    ['LOG', __builtin__(Math.log)],
    ['RND', __builtin__(Math.random, 0)],

    ['ASSERT', __raw_builtin__((arg1: Value<any>, arg2?: Value<any>) => {
        if (!arg1.assertBoolean()) {
            const message: string = arg2 === undefined ?
                'Assert error' :
                arg2.assertString();
            throw new Error(message);
        }
        return true;
    }, 1, 2)],

    ['TYPE', __raw_builtin__((arg: Value<any>): StringValue => new StringValue(arg.type()))],
    ['FREEZE', __raw_builtin_env__((env: Environment, arg: Value<any>): Value<any> => {
        const ref: string = arg.assertReference();
        env.parentOrSelf().freeze(ref);
        return env.get(ref);
    })],

    ['NUM', __raw_builtin__((arg: Value<any>): NumberValue => new NumberValue(Number(arg.value())))],
]);