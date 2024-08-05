export class BaseController {
    names: string[];

    count: {[key: string]: number};

    // currentPlayerIndex: number = 0;

    constructor(
        names: string[]
    ) {
        this.names = names;
        this.count = names.reduce((count, name) => ({ ...count, [name]: 0}), {})
    }

    /**
     * Return the current player.
     */
    // get currentPlayer(): string {
    //     return this.names[this.currentPlayerIndex];
    // }

}

export class PlayerController extends BaseController {
    name: string;

    constructor(
        names: string[],
        name: string
    ) {
        super(names);
        this.name = name;
    }

    get isMyTurn(): boolean {
        return true;
        // return this.currentPlayerIndex === this.names.findIndex((n) => n === this.name);
    }

    increment() {
        if (this.isMyTurn) {
            this.count[this.name] += 1;
            console.log("New Count", JSON.stringify(this.count, null, 4));
        }
        else {
            console.log("Not my turn!");
        }
    }
}