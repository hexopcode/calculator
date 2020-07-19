import {Executor} from '../executor';

export type CallableArity = ([number] | [number, number]);

export abstract class Callable {
    abstract call(args: any[], executor: Executor): any;
    abstract arity(): CallableArity;
}