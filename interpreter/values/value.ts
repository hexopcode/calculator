import {Callable} from '../callables/callable';

export abstract class Value<T> {
    private readonly internal: T;

    constructor(value: T) {
        this.internal = value;
    }

    abstract type(): string;

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

    assertReference(): T {
        return this.typeError('reference');
    }

    assertError(): T {
        return this.typeError('error');
    }

    assertVector(): T {
        return this.typeError('vector');
    }

    assertSameAs(other: Value<any>): void {
        const thisType = this.constructor;
        const otherType = other.constructor;
        if (thisType !== otherType) {
            other.typeError(typeof this.value());
        }
    }

    protected typeError<T>(checkedType: string): T {
        throw new Error(`${this.internal} is a ${typeof this.internal}, not a ${checkedType}`);
    }

    toString(): string {
        return this.internal.toString();
    }
}

export class AnyValue extends Value<any> {
    type(): string {
        return 'ANY';
    }
}