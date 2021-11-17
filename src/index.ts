import {Client,  Intents } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config()

const disc = new Client({
    intents: [Intents.FLAGS.GUILDS]
});

disc.on('ready', () => {
    console.log(`Logged in as ${disc.user.tag}!`);
});

disc.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'user') {
        await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	}
});

console.log(process.env.TOKEN)
disc.login(process.env.TOKEN)