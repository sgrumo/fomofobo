import { appPathOf } from "domain/app-links"

/**
 * @description Maps a shared web link of the map, which the phone hands to the app, to the map
 * screen with the same query
 * @param event URL that opened the app
 * @remarks Keeps every other URL as it is, the custom scheme included
 */
export const redirectSystemPath = (event: { path: string; initial: boolean }): string =>
    appPathOf(event.path) ?? event.path
