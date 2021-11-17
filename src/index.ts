import {Client,  Guild,  GuildMember,  Intents, Interaction, Snowflake } from 'discord.js';
import { VoiceConnection, joinVoiceChannel, createAudioPlayer, AudioPlayerStatus, VoiceConnectionStatus, entersState
 } from '@discordjs/voice'
import dotenv from 'dotenv';
import { Track } from './Track'
import { AudioPlayerState } from './AudioPlayerState'

dotenv.config()

const subscriptions = new Map<Snowflake, VoiceConnection>();
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
	} else if (commandName == 'join') {
        await interaction.deferReply()
        let subscription = subscriptions.get(interaction.guildId)
        if(interaction.member instanceof GuildMember && interaction.member.voice.channel) {
            console.log('Join command executed')
            const channel = interaction.member.voice.channel
            subscription = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            })
            subscription.on('error', console.warn)
            audioPlayer = createAudioPlayer()
            audioPlayer.on('stateChange', (oldState: AudioPlayerState, newState: AudioPlayerState) => {
                if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                    // If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
                    // The queue is then processed to start playing the next track, if one is available.
                    oldState.resource.metadata.onFinish();
                    void processQueue();
                } else if (newState.status === AudioPlayerStatus.Playing) {
                    // If the Playing state has been entered, then a new track has started playback.
                    newState.resource.metadata.onStart();
                }
            });
            subscription.subscribe(audioPlayer);

            subscriptions.set(interaction.guildId, subscription)
        } else {
            await interaction.followUp(`You are not connected to a voice channel!`)
        }
        try {
			await entersState(subscription, VoiceConnectionStatus.Ready, 20e3);
		} catch (error) {
			console.warn(error);
			await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!');
			return;
		}
    } else if (commandName == 'play') {
        await interaction.deferReply()
        if(!subscriptions.get(interaction.guildId)) {
            await interaction.reply(`Not in a voice channel, please use /join`)
        }
        const url = interaction.options.get('song')!.value! as string;

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
			enqueue(track);
			await interaction.followUp(`Enqueued **${track.title}**`);
		} catch (error) {
			console.warn(error);
			await interaction.followUp('Failed to play track, please try again later!');
		}
    }
});

const enqueue = (track: Track) => {
    queue.push(track);
    void processQueue();
}


const processQueue = async () =>  {
    // If the queue is locked (already being processed), is empty, or the audio player is already playing something, return
    if (queueLock || audioPlayer.state.status !== AudioPlayerStatus.Idle || queue.length === 0) {
        return;
    }
    // Lock the queue to guarantee safe access
    queueLock = true;

    // Take the first item from the queue. This is guaranteed to exist due to the non-empty check above.
    const nextTrack = queue.shift()!;
    try {
        // Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
        const resource = await nextTrack.createAudioResource();
        audioPlayer.play(resource);
        queueLock = false;
    } catch (error) {
        // If an error occurred, try the next item of the queue instead
        nextTrack.onError(error as Error);
        queueLock = false;
        return processQueue();
    }
}

console.log(process.env.TOKEN)
disc.login(process.env.TOKEN)