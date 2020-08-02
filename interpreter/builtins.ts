import {__builtin__, __raw_builtin__, __raw_builtin_env__} from './callables/native';
import {BooleanValue, NumberValue, StringValue, VectorValue} from './values/typed';
import {Environment} from './environment';
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
        return new BooleanValue(true);
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
    ['ASSIGN', __raw_builtin_env__((env: Environment, arg1: Value<any>, arg2: Value<any>): Value<any> => {
        const ref: string = arg1.assertReference();
        env.define(ref, arg2);
        return arg2;
    }, 2)],
    ['RESOLVE', __raw_builtin_env__((env: Environment, arg: Value<any>): Value<any> => {
        const ref: string = arg.assertReference();
        return env.get(ref);
    })],
    ['DELETE', __raw_builtin_env__((env: Environment, arg: Value<any>): Value<any> => {
        const ref: string = arg.assertReference();
        return env.delete(ref);
    })],

    ['NUM', __raw_builtin__((arg: Value<any>): NumberValue => new NumberValue(Number(arg.value())))],
    ['STR', __raw_builtin__((arg: Value<any>): StringValue => new StringValue(arg.toString().toUpperCase()))],

    ['VECEMPTY', __raw_builtin__((arg: Value<any>): BooleanValue => {
        const vec = arg.assertVector();
        return new BooleanValue(vec.length == 0);
    })],
    ['VECHEAD', __raw_builtin__((arg: Value<any>): Value<any> => {
        const vec = arg.assertVector();
        if (vec.length == 0) {
            throw new Error('Empty vector');
        }
        return vec[0];
    })],
    ['VECTAIL', __raw_builtin__((arg: Value<any>): Value<any> => {
        const vec = arg.assertVector();
        if (vec.length == 0) {
            throw new Error('Empty vector');
        }
        return new VectorValue(vec.slice(1));
    })],
    ['VECCONCAT', __raw_builtin__((arg1: Value<any>, arg2: Value<any>): Value<any> => {
        const vec1 = arg1.assertVector();
        const vec2 = arg2.assertVector();
        return new VectorValue(vec1.concat(...vec2));
    }, 2)],
]);