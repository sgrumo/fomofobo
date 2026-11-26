/**
 * @description Builds the path of the web map in a language
 * @param language Language segment of the path
 */
export const mapPathOf = (language: string): string => `/${language}/map`

/**
 * @description Builds the paths of the web origin that the native apps open in place of the
 * browser
 * @param languages Language segments the web app serves
 */
export const appLinkPathsOf = (languages: readonly string[]): string[] =>
    languages.map(mapPathOf)

// Language segment, then the query of the map. The host is the one the app claims.
const mapLinkPattern = /^https:\/\/[^/?#]+\/[^/?#]+\/map\/?(?<query>\?[^#]*)?(?:#.*)?$/u

/**
 * @description Maps a web link of the map to the path of the map screen of the native app,
 * with the same query
 * @param link URL that opened the app
 * @remarks Returns undefined for any other link, so the caller keeps it as it is
 */
export const appPathOf = (link: string): string | undefined => {
    const match = mapLinkPattern.exec(link)
    return match === null ? undefined : `/${match.groups?.query ?? ""}`
}
