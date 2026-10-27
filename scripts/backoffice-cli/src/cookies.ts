/**
 * @description Returns the name and the value of one `name=value` pair
 * @param pair Text of the pair
 */
const splitPair = (pair: string): [string, string] => {
    const trimmed = pair.trim()
    const separator = trimmed.indexOf("=")
    return separator === -1
        ? [trimmed, ""]
        : [trimmed.slice(0, separator), trimmed.slice(separator + 1)]
}

/**
 * @description Maps a `Cookie` header and the `Set-Cookie` headers of a response to the `Cookie` header of the next request
 * @param cookieHeader `Cookie` header sent, empty for none
 * @param setCookies `Set-Cookie` headers of the response
 */
export const mergeCookies = (cookieHeader: string, setCookies: string[]): string => {
    const sent = new Map(
        cookieHeader
            .split(";")
            .filter(pair => pair.includes("="))
            .map(splitPair),
    )
    const merged = setCookies.reduce((cookies, setCookie) => {
        const [pair = "", ...attributes] = setCookie.split(";")
        const [name, value] = splitPair(pair)
        const expired =
            value === "" ||
            attributes.some(attribute => /^\s*max-age\s*=\s*0\s*$/iu.test(attribute))
        const next = new Map(cookies)
        if (expired) {
            next.delete(name)
        } else {
            next.set(name, value)
        }
        return next
    }, sent)
    return [...merged].map(([name, value]) => `${name}=${value}`).join("; ")
}
