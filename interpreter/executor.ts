import {Environment} from './environment';
import {Expr} from './parser/expr';

export interface Executor {
    evaluateWithEnvironment(expr: Expr, environment: Environment): any;
    environment(): Environment;
}