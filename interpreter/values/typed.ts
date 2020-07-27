import {Callable} from '../callables/callable';
import {Expr} from '../parser/expr';
import {Value} from './value';

export class BooleanValue extends Value<boolean> {
    assertBoolean(): boolean {
        return this.value();
    }

    type(): string {
        return 'BOOL';
    }
}

export class CallableValue extends Value<Callable> {
    assertCallable(): Callable {
        return this.value();
    }

    type(): string {
        return 'FN';
    }
}

export class NumberValue extends Value<number> {
    assertNumber(): number {
        return this.value();
    }

    type(): string {
        return 'NUM';
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

    type(): string {
        return 'STR';
    }
}

export class ReferenceValue extends Value<string> {
    assertReference(): string {
        return this.value();
    }

    type(): string {
        return 'REF';
    }

    toString(): string {
        return `$${this.value()}`;
    }
}

export class ErrorValue extends Value<Error> {
    assertError(): Error {
        return this.value();
    }

    type(): string {
        return 'ERR';
    }
}