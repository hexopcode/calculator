import * as React from 'react';

import {AstPrinter} from '../interpreter/astprinter';
import {ErrorValue} from '../interpreter/values/typed';
import {Input} from './input';
import {Interpreter, InterpreterResult} from '../interpreter/interpreter';
import {Screen} from './screen';
import {Value} from '../interpreter/values/value';

type CalcProps = {};

export class Calc extends React.Component {
    private screenRef = React.createRef<Screen>();
    private interpreter = new Interpreter();

    constructor(props: CalcProps) {
        super(props);
    }

    async componentDidMount() {
        const interpreterResult = await this.interpreter.createEnvironment();
        this.updateInterpreterResult(interpreterResult, false);
    }

    render() {
        return (
            <div id="calc">
                <Screen ref={this.screenRef} />
                <Input onInput={(text) => this.handleInput(text)} />
            </div>
        );
    }

    updateInterpreterResult(interpreterResult: InterpreterResult, includeResults: boolean = true) {
        const lines = interpreterResult.all.filter(result => {
            const isResult = result instanceof Value && !(result instanceof ErrorValue);
            return !isResult || includeResults;
        });
        this.screenRef.current.addLines(...lines);
    }

    async handleInput(text: string) {
        const interpreterResult = await this.interpreter.run(text);
        this.updateInterpreterResult(interpreterResult);
    }
}