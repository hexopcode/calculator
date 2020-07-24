import {ExpressionEvaluator} from '../expressionevaluator';
import {Value} from '../values/value';

export type CallableArity = ([number] | [number, number]);

export abstract class Callable {
    abstract call(args: Value<any>[], evaluator: ExpressionEvaluator): Value<any>;
    abstract arity(): CallableArity;
}