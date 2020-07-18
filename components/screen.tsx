import * as React from 'react';

type ScreenProps = {};
type ScreenState = {
    lines: string[],
};

export class Screen extends React.Component<ScreenProps, ScreenState> {
    state: ScreenState = {
        lines: new Array<string>(),
    };

    constructor(props: ScreenProps) {
        super(props);
    }

    render() {
        return (
            <div id="screen">
                {this.state.lines.map((line, idx) => (
                    <div key={idx}>{line}</div>
                ))}
            </div>
        );
    }

    addLines(...lines: string[]) {
        this.setState({
            lines: this.state.lines.concat(lines),
        });
    }
}