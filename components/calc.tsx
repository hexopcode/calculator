import * as React from 'react';

import {AstPrinter} from '../interpreter/astprinter';
import {Input} from './input';
import {Interpreter, InterpreterResult} from '../interpreter/interpreter';
import {Screen} from './screen';

type CalcProps = {};

export class Calc extends React.Component {
    private screenRef = React.createRef<Screen>();
    private interpreter = new Interpreter();

    constructor(props: CalcProps) {
        super(props);
    }

    async componentDidMount() {
        const interpreterResult = await this.interpreter.createEnvironment();
        this.renderInterpreterResult(interpreterResult, false);
    }

    render() {
        return (
            <div id="calc">
                <Screen ref={this.screenRef} />
                <Input onInput={(text) => this.handleInput(text)} />
            </div>
        );
    }

    renderInterpreterResult(interpreterResult: InterpreterResult, renderResults: boolean = true) {
        const errors = interpreterResult.errors.map(e => e.toString());
        const statements = interpreterResult.statements.map(stmt => new AstPrinter().print(stmt));
        const results = renderResults ? interpreterResult.results.map(r => r.toString()) : [];

        this.screenRef.current.addLines(...errors, ...statements, ...results);
    }

    async handleInput(text: string) {
        const interpreterResult = await this.interpreter.run(text);
        this.renderInterpreterResult(interpreterResult);
    }
}