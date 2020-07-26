import {__builtin__, __raw_builtin__, __raw_builtin_env__} from './callables/native';
import {Environment} from './environment';
import {NumberValue, StringValue, BooleanValue} from './values/typed';
import {Value} from './values/value';

const MATHLIB = `
IMPORT "MATHLIB/CORE.MATH"

# COMMON CONSTANTS
CONST E = 2.718281828459045
CONST PI = 3.141592653589793

# RANDOM FUNCTIONS
CONST FN RNDRANGE(X, Y) = RND() * (Y - X) + X
CONST FN RNDRANGEINT(X, Y) = FLOOR(RND() * (FLOOR(Y) - CEIL(X))) + CEIL(X)

# ROOT FUNCTIONS
CONST FN SQRT(X) = X ^ (1 / 2)
FN ROOT(X, Y) = -(-X ^ (1 / Y)), X < 0
FN ROOT(X, Y) = X ^ (1 / Y)
FREEZE($ROOT)

# LOGARITHMIC FUNCTIONS
CONST FN EXP(X) = E ^ X
CONST FN LOGN(X, N) = LOG(X) / LOG(N)
CONST FN LOG10(X) = LOGN(X, 10)
CONST FN LOG2(X) = LOGN(X, 2)

# INTEGER FUNCTIONS
CONST FN ABS(X) = |X|
CONST FN SGN(X) = X > 0 ? 1 : X < 0 ? -1 : 0
CONST FN TRUNC(X) = INT(X)
CONST FN FRAC(X) = X - FLOOR(X)
CONST FN FRAC2(X) = |X| - FLOOR(|X|)
CONST FN FRAC3(X) = X - INT(|X|) * SGN(X)

# MAX/MIN FUNCTIONS
CONST FN MAX(X, Y) = X > Y ? X : Y
CONST FN MIN(X, Y) = X < Y ? X : Y

# TRIGONOMETRIC FUNCTIONS
CONST FN COT(X) = 1 / TAN(X)
CONST FN SEC(X) = 1 / COS(X)
CONST FN CSEC(X) = 1 / SIN(X)

CONST FN SINH(X) = (1 - EXP(-2 * X)) / (2 * EXP(-X))
CONST FN COSH(X) = (1 + EXP(-2 * X)) / (2 * EXP(-X))
CONST FN TANH(X) = (EXP(2 * X) - 1) / (EXP(2 * X) + 1)
CONST FN COTH(X) = (EXP(2 * X) + 1) / (EXP(2 * X) - 1)
CONST FN SECH(X) = (2 * EXP(X)) / (EXP(2 * X) + 1)
CONST FN CSECH(X) = (2 * EXP(X)) / (EXP(2 * X) - 1)

CONST FN ASINH(X) = LOG(X + SQRT(X * X + 1))
CONST FN ACOSH(X) = LOG(X + SQRT(X * X - 1))
CONST FN ATANH(X) = LOG((1 + X) / (1 - X)) / 2
CONST FN ACOTH(X) = LOG((X + 1) / (X - 1)) / 2
CONST FN ASECH(X) = LOG((1 + SQRT(1 - X ^ 2)) / X)
CONST FN ACSECH(X) = LOG((1 / 2) + SQRT((1 / (X ^ 2)) + 1))

# MISC FORMULAS
CONST FN HYPOT(X, Y) = SQRT(X ^ 2 + Y ^ 2)
CONST FN FAC(X) = X == 0 ? 1 : X * FAC(X - 1)
CONST FN FIB(X) = X == 0 ? 0 : X < 3 ? 1 : FIB(X - 1) + FIB(X - 2)
`;

export const MATHLIB_STATEMENTS = MATHLIB;

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
    ['ISDEF', __raw_builtin_env__((env: Environment, arg: Value<any>): Value<any> => {
        const ref: string = arg.assertReference();
        return new BooleanValue(env.isDefined(ref));
    })],
    ['ISFROZEN', __raw_builtin_env__((env: Environment, arg: Value<any>): Value<any> => {
        const ref: string = arg.assertReference();
        return new BooleanValue(env.isDefined(ref) && env.isConstant(ref));
    })],
    ['RESOLVE', __raw_builtin_env__((env: Environment, arg: Value<any>): Value<any> => {
        const ref: string = arg.assertReference();
        return env.get(ref);
    })],
    ['DELETE', __raw_builtin_env__((env: Environment, arg: Value<any>): Value<any> => {
        const ref: string = arg.assertReference();
        return env.delete(ref);
    })],

    ['NUM', __raw_builtin__((arg: Value<any>): NumberValue => new NumberValue(Number(arg.value())))],
]);