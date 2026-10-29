import { once } from "es-toolkit"
import { createAudioPlayer } from "expo-audio"

import saveSound from "../../../assets/sounds/save.flac"

// One player for every save, loaded at the first save
const savePlayer = once(() => createAudioPlayer(saveSound))

/**
 * @description Plays the sound of a save from its start
 */
export const playSaveSound = () => {
    const player = savePlayer()
    void player.seekTo(0)
    player.play()
}
