import * as React from 'react';

import {AstPrinter} from '../interpreter/astprinter';
import {ErrorValue} from '../interpreter/values/typed';
import {Input} from './input';
import {Interpreter, InterpreterResult, InterpreterResultType} from '../interpreter/interpreter';
import {Screen} from './screen';
import {Stmt} from '../interpreter/parser/stmt';


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
        const lines = interpreterResult.all.map((result: InterpreterResultType) => {
            if (result instanceof ErrorValue) {
                return result.toString();
            } else if ((result as Stmt).accept) {
                return new AstPrinter().print(result as Stmt);
            } else {
                return includeResults ? result.toString() : null
            }
        }).filter(result => result !== null);

        this.screenRef.current.addLines(...lines);
    }

    async handleInput(text: string) {
        const interpreterResult = await this.interpreter.run(text);
        this.updateInterpreterResult(interpreterResult);
    }
}