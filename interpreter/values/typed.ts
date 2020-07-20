import {Callable} from '../callables/callable';
import {Value} from './value';

export class BooleanValue extends Value<boolean> {
    assertBoolean(): boolean {
        return this.value();
    }
}

export class CallableValue extends Value<Callable> {
    assertCallable(): Callable {
        return this.value();
    }
}

export class NumberValue extends Value<number> {
    assertNumber(): number {
        return this.value();
    }
}

export class StringValue extends Value<string> {
    assertString(): string {
        return this.value();
    }

}