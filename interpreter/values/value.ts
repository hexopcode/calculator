import {Callable} from '../callables/callable';

export abstract class Value<T> {
    private readonly internal: T;

    constructor(value: T) {
        this.internal = value;
    }

    value(): T {
        return this.internal;
    }

    abstract assertBoolean(): T;
    abstract assertCallable(): T;
    abstract assertNumber(): T;
    abstract assertString(): T;

    protected typeError<T>(checkedType: string): T {
        throw new Error(`${this.internal} is a ${typeof this.internal}, not a ${checkedType}`);
    }

    toString(): string {
        return this.internal.toString();
    }
}