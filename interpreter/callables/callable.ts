import {Executor} from '../executor';
import {Value} from '../values/value';

export type CallableArity = ([number] | [number, number]);

export abstract class Callable {
    abstract call(args: Value<any>[], executor: Executor): Value<any>;
    abstract arity(): CallableArity;
}