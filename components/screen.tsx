import * as React from 'react';

import {AstPrinter} from '../interpreter/astprinter';
import {InterpreterResultType} from '../interpreter/interpreter';
import {Stmt} from '../interpreter/parser/stmt';
import {Value} from '../interpreter/values/value';

type ScreenProps = {};
type ScreenState = {
    lines: InterpreterResultType[],
};

export class Screen extends React.Component<ScreenProps, ScreenState> {
    private screenRef = React.createRef<HTMLDivElement>();

    state: ScreenState = {
        lines: new Array<InterpreterResultType>(),
    };

    constructor(props: ScreenProps) {
        super(props);
    }

    componentDidUpdate() {
        this.screenRef.current.scrollTop = this.screenRef.current.scrollHeight;
    }

    renderResultType(result: InterpreterResultType): string {
        if (result instanceof Value) {
            return result.toString();
        } else {
            return new AstPrinter().print(result as Stmt);
        }
    }

    render() {
        return (
            <div id="screen" ref={this.screenRef}>
                {this.state.lines.map((line, idx) => (
                    <div key={idx}>{this.renderResultType(line)}</div>
                ))}
            </div>
        );
    }

    addLines(...lines: InterpreterResultType[]) {
        this.setState({
            lines: this.state.lines.concat(lines),
        });
    }
}