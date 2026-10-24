import type { PlatformOSType, ShareContent } from "react-native"

/**
 * @description Builds the content of the system share sheet for a link and its text
 * @param os Operating system of the device, `Platform.OS`
 * @param shared Link and text of the share
 * @remarks Puts the link inside the message off iOS: the Android sheet ignores `url`
 */
export const shareContentOf = (
    os: PlatformOSType,
    shared: { url: string; text: string },
): ShareContent =>
    os === "ios"
        ? { url: shared.url, message: shared.text }
        : { message: `${shared.text} ${shared.url}` }
