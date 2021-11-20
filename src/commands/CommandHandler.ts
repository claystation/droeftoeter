import { ICommand } from "./ICommand";
import PlayCommand from "./PlayCommand";

class CommandHandler {

    commandsMap = new Map<String, ICommand>();

    constructor(){
        this.registerCommands();
    }

    private registerCommands() {
        this.commandsMap.set("play", new PlayCommand())
    }

    public runCommand(commandName: string) {
        this.commandsMap.get(commandName).run();
    }
}