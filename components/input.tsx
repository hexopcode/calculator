import * as React from 'react';

type InputProps = {
    onInput?: (text: string) => void,
};

export class Input extends React.Component<InputProps> {
    private inputRef = React.createRef<HTMLInputElement>();
    private history: string[] = [];
    private historyCursor: number = 0;

    static defaultProps: InputProps = {
        onInput: () => {},
    };

    constructor(props: InputProps) {
        super(props);
    }

    render() {
        return (
            <input type="text"
                   id="input"
                   ref={this.inputRef}
                   onKeyDown={(e) => this.keyDown(e)}
                   onKeyPress={(e) => this.keyPressed(e)} />
        );
    }

    componentDidMount() {
        this.inputRef.current.focus();
    }

    keyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        switch (e.which) {
            case 38:
                this.historyCursor = Math.max(--this.historyCursor, 0);
                if (this.historyCursor < this.history.length) {
                    this.inputRef.current.value = this.history[this.historyCursor];
                }
                break;
            case 40:
                this.historyCursor = Math.min(++this.historyCursor, this.history.length);
                if (this.historyCursor == this.history.length) {
                    this.inputRef.current.value = '';
                } else {
                    this.inputRef.current.value = this.history[this.historyCursor];
                }
                break;
            default:
                break;
        }
    }

    keyPressed(e: React.KeyboardEvent<HTMLInputElement>) {
        switch (e.which) {
            case 13:
                const formatted = this.inputRef.current.value.trim().toUpperCase();
                if (formatted) {
                    this.history.push(formatted);
                    this.historyCursor = this.history.length;
                    this.props.onInput(formatted);
                }
                this.inputRef.current.value = '';
                break;
            case 27:
                this.inputRef.current.value = '';
                this.historyCursor = this.history.length;
                break;
            default:
                break;
        }
    }
}