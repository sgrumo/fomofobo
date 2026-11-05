/**
 * @description Builds the URL of the privacy policy page of the web app
 * @param baseUrl Origin of the web app
 * @param language Language segment of the path
 */
export const privacyUrlOf = (baseUrl: string, language: string): string =>
    new URL(`/${language}/privacy`, baseUrl).href

/**
 * @description Builds the URL of the support page of the web app
 * @param baseUrl Origin of the web app
 * @param language Language segment of the path
 */
export const supportUrlOf = (baseUrl: string, language: string): string =>
    new URL(`/${language}/support`, baseUrl).href
