import { ICommand } from "./ICommand";
import PlayCommand from "./PlayCommand";

class CommandHandler {

    commandsMap = new Map<String, ICommand>();

    constructor(){

    }

    public registerCommands(commands: Map<String,ICommand>) {
        this.commandsMap = commands;
    }

    public runCommand(commandName: string) {
        this.commandsMap.get(commandName).run();
    }
}

export default CommandHandler