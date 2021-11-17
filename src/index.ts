import Discord, { Intents } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config()

const disc = new Discord.Client({
    intents: [Intents.FLAGS.GUILDS]
});

disc.on('ready', () => {
    console.log(`Logged in as ${disc.user.tag}!`);
});

console.log(process.env.TOKEN)
disc.login(process.env.TOKEN)