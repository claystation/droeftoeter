import { Client, Guild, GuildMember, Intents, Interaction, MessagePayload, Snowflake } from 'discord.js';
import {
    VoiceConnection, joinVoiceChannel, createAudioPlayer, AudioPlayerStatus, VoiceConnectionStatus, entersState
} from '@discordjs/voice'
import dotenv from 'dotenv';
import { Track } from './Track'
import { AudioPlayerState } from './AudioPlayerState'
import { MusicSubscription } from './MusicSubscription';

dotenv.config()

const subscriptions = new Map<Snowflake, MusicSubscription>();
let queueLock = false;
const queue: Track[] = []
let audioPlayer;

const disc = new Client({
    intents: ['GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILDS']
});

disc.on('ready', () => {
    console.log(`Logged in as ${disc.user.tag}!`);
});

disc.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    } else if (commandName === 'server') {
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
    } else if (commandName === 'user') {
        await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
    } else if (commandName == 'play') {
        await interaction.deferReply()
        let subscription = subscriptions.get(interaction.guildId)
        const url = interaction.options.get('song')!.value! as string;

        if (!subscriptions.get(interaction.guildId)) {
            if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
                console.log('Join command executed')
                const channel = interaction.member.voice.channel
                subscription = new MusicSubscription(joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator
                }))
                subscription.voiceConnection.on('error', console.warn)

                subscriptions.set(interaction.guildId, subscription)
            } else {
                await interaction.followUp(`You are not connected to a voice channel!`)
            }
        }

        try {
            await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
        } catch (error) {
            console.warn(error);
            await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!');
            return;
        }

        try {
            // Attempt to create a Track from the user's video URL
            const track = await Track.from(url, {
                onStart() {
                    interaction.followUp({ content: 'Now playing!', ephemeral: true }).catch(console.warn);
                },
                onFinish() {
                },
                onError(error) {
                    console.warn(error);
                    interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true }).catch(console.warn);
                },
            });
            // Enqueue the track and reply a success message to the user
            subscription.enqueue(track);
            await interaction.followUp(`Enqueued **${track.title}**`);
        } catch (error) {
            console.warn(error);
            await interaction.followUp('Failed to play track, please try again later!');
        }
    } else if (commandName == 'np') {
        let subscription = subscriptions.get(interaction.guildId)
        if (subscription) {
            await interaction.reply({ content: `Now playing: ${subscription.nowPlaying()}` })
        } else {
            await interaction.reply({content: `Nothing playing right now`})
        }
    }
});

console.log(process.env.TOKEN)
disc.login(process.env.TOKEN)
