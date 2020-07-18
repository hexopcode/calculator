export type CallableArity = ([number] | [number, number]);

export abstract class Callable {
    abstract call(args: any[]): any;
    abstract arity(): CallableArity;
}