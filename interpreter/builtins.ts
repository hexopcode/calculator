import {__builtin__, __raw_builtin__, __raw_builtin_env__} from './callables/native';
import {Environment} from './environment';
import {NumberValue, StringValue, BooleanValue} from './values/typed';
import {Value} from './values/value';

export const BUILTINS = new Map([
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