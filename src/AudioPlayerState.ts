import { AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { Track } from './Track'

export class AudioPlayerState {
    public status?: AudioPlayerStatus;
    public resource?: AudioResource<Track>;
}