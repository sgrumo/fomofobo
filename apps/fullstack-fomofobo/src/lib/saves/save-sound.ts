// Served from `public/sounds`
const SAVE_SOUND_URL = "/sounds/save.flac"

/**
 * @description Plays the sound of a save, silent when the browser refuses to play it
 */
export const playSaveSound = () => {
    void new Audio(SAVE_SOUND_URL).play().catch(() => undefined)
}
