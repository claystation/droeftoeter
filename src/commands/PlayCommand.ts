import { ICommand } from "./ICommand";

class PlayCommand implements ICommand {
    constructor() {

    }
    run() {
        throw new Error("Method not implemented.");
    }

}

export default PlayCommand