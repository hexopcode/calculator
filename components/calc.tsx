import * as React from 'react';

import {Input} from './input';
import {Screen} from './screen';

import {Interpreter} from '../interpreter/interpreter';

type CalcProps = {};

export class Calc extends React.Component {
    private screenRef = React.createRef<Screen>();
    private interpreter = new Interpreter();

    constructor(props: CalcProps) {
        super(props);
    }

    render() {
        return (
            <div id="calc">
                <Screen ref={this.screenRef} />
                <Input onInput={(text) => this.handleInput(text)} />
            </div>
        );
    }

    handleInput(text: string) {
        const result: string[] = this.interpreter.run(text);
        this.screenRef.current.addLines(...result);
    }
}