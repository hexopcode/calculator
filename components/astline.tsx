import * as React from 'react';

import {AstPrinter} from '../interpreter/astprinter';
import {Stmt} from '../interpreter/parser/stmt';

type AstLineProps = {
    ast: Stmt;
};

export class AstLine extends React.Component<AstLineProps> {
    constructor(props: AstLineProps) {
        super(props);
    }

    render() {
        return (
            <div className="ast">{new AstPrinter().print(this.props.ast)}</div>
        );
    }
}