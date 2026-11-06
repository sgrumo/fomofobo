import { mapValues, once, sample } from "es-toolkit"
import { createAudioPlayer } from "expo-audio"

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

// One player per version, loaded at its first play
const SOUND_PLAYERS = mapValues(SOUND_SOURCES, sources =>
    sources.map(source => once(() => createAudioPlayer(source))),
)

/**
 * @description Plays one version of a sound picked at random, from its start, silent when the user muted the sounds
 * @param sound Sound to play
 */
export const playSound = (sound: Sound) => {
    if (deviceStorage.getItem("sounds-muted")) {
        return
    }
    const player = sample(SOUND_PLAYERS[sound])()
    void player.seekTo(0)
    player.play()
}
