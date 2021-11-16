import Discord, { Intents } from 'discord.js';

const disc = new Discord.Client({
    intents: [Intents.FLAGS.GUILD_VOICE_STATES]
});

disc.on('ready', () => {
    console.log(`Logged in as ${disc.user.tag}!`);
});

disc.login("")