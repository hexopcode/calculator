import * as React from 'react';

import {Value} from '../interpreter/values/value';

type ResultLineProps = {
    result: Value<any>;
};

export class ResultLine extends React.Component<ResultLineProps> {
    constructor(props: ResultLineProps) {
        super(props);
    }

    render() {
        return (
            <div className="result">{this.props.result.toString()}</div>
        );
    }
}