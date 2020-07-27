import * as React from 'react';

type ScreenProps = {};
type ScreenState = {
    lines: string[],
};

export class Screen extends React.Component<ScreenProps, ScreenState> {
    private screenRef = React.createRef<HTMLDivElement>();

    state: ScreenState = {
        lines: new Array<string>(),
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