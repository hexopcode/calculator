import * as React from 'react';

import {AstLine} from './astline';
import {InterpreterResultType} from '../interpreter/interpreter';
import {ErrorLine} from './errorline';
import {ErrorValue} from '../interpreter/values/typed';
import {ResultLine} from './resultline';
import {Stmt} from '../interpreter/parser/stmt';
import {Value} from '../interpreter/values/value';

enum RenderResultType {
    AST,
    ERROR,
    RESULT,
};

function renderResultType(result: InterpreterResultType): RenderResultType {
    if (result instanceof ErrorValue) {
        return RenderResultType.ERROR;
    } else if (result instanceof Value) {
        return RenderResultType.RESULT;
    } else {
        return RenderResultType.AST;
    }
}

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

    render() {
        return (
            <div id="screen" ref={this.screenRef}>
                {this.state.lines.map((line, idx) => {
                    switch (renderResultType(line)) {
                        case RenderResultType.ERROR:
                            return <ErrorLine key={idx} error={line as ErrorValue} />;
                        case RenderResultType.AST:
                            return <AstLine key={idx} ast={line as Stmt} />;
                        case RenderResultType.RESULT:
                            return <ResultLine key={idx} result={line as Value<any>} />;
                        default:
                            throw new Error('Unimplemented');
                    }
                })}
            </div>
        );
    }

    addLines(...lines: InterpreterResultType[]) {
        this.setState({
            lines: this.state.lines.concat(lines),
        });
    }
}