import {Callable} from '../callables/callable';
import {Value} from './value';

export class BooleanValue extends Value<boolean> {
    assertBoolean(): boolean {
        return this.value();
    }

    assertCallable(): boolean {
        return this.typeError('boolean');
    }

    assertNumber(): boolean {
        return this.typeError('boolean');
    }

    assertString(): boolean {
        return this.typeError('boolean');
    }
}

export class CallableValue extends Value<Callable> {
    assertBoolean(): Callable {
        return this.typeError('Callable');
    }

    assertCallable(): Callable {
        return this.value();
    }

    assertNumber(): Callable {
        return this.typeError('Callable');
    }

    assertString(): Callable {
        return this.typeError('Callable');
    }
}

export class NumberValue extends Value<number> {
    assertBoolean(): number {
        return this.typeError('number');
    }

    assertCallable(): number {
        return this.typeError('number');
    }

    assertNumber(): number {
        return this.value();
    }

    assertString(): number {
        return this.typeError('number');
    }
}

export class StringValue extends Value<string> {
    assertBoolean(): string {
        return this.typeError('string');
    }

    assertCallable(): string {
        return this.typeError('string');
    }

    assertNumber(): string {
        return this.typeError('string');
    }

    assertString(): string {
        return this.value();
    }

}