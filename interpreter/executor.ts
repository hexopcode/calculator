import {Environment} from './environment';
import {Expr} from './parser/expr';
import {Value} from './values/value';

export interface Executor {
    evaluateWithEnvironment(expr: Expr, environment: Environment): Value<any>;
    environment(): Environment;
}