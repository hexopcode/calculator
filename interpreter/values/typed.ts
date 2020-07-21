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

    toString(): string {
        const valueWithPrecision = this.value().toPrecision(10);
        return Number.isInteger(Number.parseFloat(valueWithPrecision)) ?
            valueWithPrecision.replace(/\.0+$/, '') :
            valueWithPrecision.replace(/0+$/, '');
    }
}

export class StringValue extends Value<string> {
    assertString(): string {
        return this.value();
    }

}