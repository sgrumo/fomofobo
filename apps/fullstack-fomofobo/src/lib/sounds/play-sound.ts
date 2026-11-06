import { sample } from "es-toolkit"

import { localStorage } from "@/lib/storage/local-storage"

// Versions of each sound, served from `public/sounds`
const SOUND_URLS = {
    event: ["/sounds/event-v1.flac", "/sounds/event-v2.flac"],
    cluster: ["/sounds/cluster-v1.flac", "/sounds/cluster-v2.flac"],
    "save-on": ["/sounds/save-on.flac"],
    "save-off": ["/sounds/save-off.flac"],
}

export type Sound = keyof typeof SOUND_URLS

/**
 * @description Plays one version of a sound picked at random, silent when the visitor muted the sounds or the browser refuses to play it
 * @param sound Sound to play
 */
export const playSound = (sound: Sound) => {
    if (localStorage.getItem("sounds-muted")) {
        return
    }
    void new Audio(sample(SOUND_URLS[sound])).play().catch(() => undefined)
}
