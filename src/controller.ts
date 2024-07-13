export class Controller {
    names: string[];

    count: [string, number];

    constructor(
        names: string[]
    ) {
        this.names = names;
        this.count = {} as [string, number];
    }
}