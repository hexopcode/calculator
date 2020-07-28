import * as React from 'react';

import {ErrorValue} from '../interpreter/values/typed';

type ErrorLineProps = {
    error: ErrorValue;
};

export class ErrorLine extends React.Component<ErrorLineProps> {
    constructor(props: ErrorLineProps) {
        super(props);
    }

    render() {
        return (
            <div className="error">{this.props.error.toString()}</div>
        );
    }
}