import {Callable} from './callables/callable';

export abstract class Value<T> {
    private readonly internal: T;

    constructor(value: T) {
        this.internal = value;
    }

    value(): T {
        return this.internal;
    }

    assertBoolean(): T {
        if (typeof this.internal === 'boolean') {
            return this.internal;
        }
        this.typeError('boolean');
    }

    assertCallable(): T {
        if (this.internal instanceof Callable) {
            return this.internal;
        }
        this.typeError('Callable');
    }

    assertNumber(): T {
        if (typeof this.internal === 'number' && !isNaN(this.internal)) {
            return this.internal;
        }
        this.typeError('number');
    }

    assertString(): T {
        if (typeof this.internal === 'string') {
            return this.internal;
        }
        this.typeError('string');
    }

    private typeError(checkedType: string) {
        throw new Error(`${this.internal} is a ${typeof this.internal}, not a ${checkedType}`);
    }

    toString(): string {
        return this.internal.toString();
    }
}

export class BooleanValue extends Value<boolean> {}
export class CallableValue extends Value<Callable> {}
export class NumberValue extends Value<number> {}
export class StringValue extends Value<string> {}