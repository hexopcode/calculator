export class Environment {
    private parent: Environment;
    private constants: Map<string, any> = new Map();
    private values: Map<string, any> = new Map();

    constructor(parent: Environment = null) {
        this.parent = parent;
    }

    define(name: string, value: any) {
        if (this.constants.has(name)) {
            throw new Error(`Cannot override value of "${name}"`);
        }
        this.values.set(name, value);
    }

    defineConstant(name: string, value: any) {
        if (this.constants.has(name) || this.values.has(name)) {
            throw new Error(`Cannot override value of "${name}`);
        }
        this.constants.set(name, value);
    }

    isConstant(name: string): boolean {
        return this.constants.has(name) || (this.parent && this.parent.constants.has(name));
    }

    isDefined(name: string): boolean {
        return this.constants.has(name) ||
            this.values.has(name) ||
            (this.parent && this.parent.isDefined(name));
    }

    get(name: string): any {
        if (this.constants.has(name)) {
            return this.constants.get(name);
        }
        if (this.values.has(name)) {
            return this.values.get(name);
        }
        if (this.parent) {
            return this.parent.get(name);
        }

        throw new Error(`Undefined variable: "${name}`);
    }
}