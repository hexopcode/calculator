import {Callable} from '../callables/callable';

export abstract class Value<T> {
    private readonly internal: T;

    constructor(value: T) {
        this.internal = value;
    }

    value(): T {
        return this.internal;
    }

    assertBoolean(): T {
        return this.typeError('boolean');
    }
    
    assertCallable(): T {
        return this.typeError('Callable');
    }

    assertNumber(): T {
        return this.typeError('number');
    }

    assertString(): T {
        return this.typeError('string');
    }

    protected typeError<T>(checkedType: string): T {
        throw new Error(`${this.internal} is a ${typeof this.internal}, not a ${checkedType}`);
    }

    toString(): string {
        return this.internal.toString();
    }
}