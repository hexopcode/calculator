import * as React from 'react';

import {ErrorValue} from '../interpreter/values/typed';
import {Input} from './input';
import {Interpreter, InterpreterResult, InterpreterPragma, InterpreterPragmaAttributes} from '../interpreter/interpreter';
import {Screen} from './screen';
import {Value} from '../interpreter/values/value';
import {Stmt} from '../interpreter/parser/stmt';

type CalcProps = {};

export class Calc extends React.Component {
    private screenRef = React.createRef<Screen>();
    private interpreter = new Interpreter();
    private shouldRenderAst: boolean = true;
    private shouldRenderResult: boolean = true;

    constructor(props: CalcProps) {
        super(props);
    }

    async componentDidMount() {
        const interpreterResult = await this.interpreter.createEnvironment();
        this.updateInterpreterResult(interpreterResult);
    }

    handlePragma(pragma: InterpreterPragma) {
        if (pragma.name === 'OUTPUT') {
            this.handlePragmaOutput(pragma.attributes);
        }
    }

    handlePragmaOutput(attributes: InterpreterPragmaAttributes) {
        attributes.forEach((value: (boolean|string|number), key: string) => {
            switch (key) {
                case 'AST':
                    this.shouldRenderAst = value as boolean;
                    break;
                case 'RESULT':
                    this.shouldRenderResult = value as boolean;
                    break;
                default:
                    break;
            }
        });
    }

    render() {
        return (
            <div id="calc">
                <Screen ref={this.screenRef} />
                <Input onInput={(text) => this.handleInput(text)} />
            </div>
        );
    }

    updateInterpreterResult(interpreterResult: InterpreterResult) {
        const lines = interpreterResult.all.filter(result => {
            if (result instanceof InterpreterPragma) {
                this.handlePragma(result);
                return false;
            }

            const isAst = (result as Stmt).accept;
            const isError = result instanceof ErrorValue;
            const isResult = (result instanceof Value) && !isError;
            
            if (isAst && this.shouldRenderAst) {
                return true;
            } else if (isResult && this.shouldRenderResult) {
                return true;
            } else if (isError) {
                return true;
            }
            return false;
        });
        this.screenRef.current.addLines(...lines);
    }

    async handleInput(text: string) {
        const interpreterResult = await this.interpreter.run(text);
        this.updateInterpreterResult(interpreterResult);
    }
}