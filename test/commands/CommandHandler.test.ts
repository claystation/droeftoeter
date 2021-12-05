import CommandHandler from '../../src/commands/CommandHandler';
import PlayCommand from '../../src/commands/PlayCommand';

jest.mock('../../src/commands/PlayCommand')
// test('The Play command is registered', () => {
//     const handler = new CommandHandler();
//     handler.runCommand('Play');
//     spyOn(PlayCommand, );
// });
it('A command can be ran', () => {
    const handler = new CommandHandler();
    handler.registerCommands(new Map([["play", new PlayCommand()]]))
    expect(PlayCommand).toHaveBeenCalledTimes(1);
    const runSpy = jest.spyOn(PlayCommand.prototype, 'run')
    handler.runCommand('play')
    expect(runSpy).toHaveBeenCalledTimes(1);
    
}); 