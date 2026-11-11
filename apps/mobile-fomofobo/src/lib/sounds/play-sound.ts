import { mapValues, once, sample } from "es-toolkit"
import { createAudioPlayer } from "expo-audio"
import type { AudioSource } from "expo-audio"

import { deviceStorage } from "@/lib/storage/device-storage"

import clusterV1 from "../../../assets/sounds/cluster-v1.flac"
import clusterV2 from "../../../assets/sounds/cluster-v2.flac"
import eventV1 from "../../../assets/sounds/event-v1.flac"
import eventV2 from "../../../assets/sounds/event-v2.flac"
import saveOff from "../../../assets/sounds/save-off.flac"
import saveOn from "../../../assets/sounds/save-on.flac"

const SOUND_SOURCES = {
    event: [eventV1, eventV2],
    cluster: [clusterV1, clusterV2],
    "save-on": [saveOn],
    "save-off": [saveOff],
}

export type Sound = keyof typeof SOUND_SOURCES

/**
 * @description Builds the player of one sound version, rewound at the end of each play
 * @param source Sound file played
 */
const soundPlayerOf = (source: AudioSource) => {
    // The session stays up between two sounds, so a play starts with no session to wake
    const player = createAudioPlayer(source, { keepAudioSessionActive: true })
    player.addListener("playbackStatusUpdate", status => {
        if (status.didJustFinish) {
            void player.seekTo(0)
        }
    })
    return player
}

const soundPlayers = once(() =>
    mapValues(SOUND_SOURCES, sources => sources.map(soundPlayerOf)),
)

/**
 * @description Builds every sound player, so the first play of each sound starts at once
 */
export const loadSounds = () => {
    soundPlayers()
}

/**
 * @description Plays one version of a sound picked at random, from its start, silent when the user muted the sounds
 * @param sound Sound to play
 */
export const playSound = (sound: Sound) => {
    if (deviceStorage.getItem("sounds-muted")) {
        return
    }
    const player = sample(soundPlayers()[sound])
    // A finished player is rewound already, so only a replay mid-sound seeks
    if (player.playing) {
        void player.seekTo(0)
    }
    player.play()
}
