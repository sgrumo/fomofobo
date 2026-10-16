import { buildLoginPath } from "@/lib/auth/return-path"

/**
 * @description Sends the browser to the login page, keeping the current path
 * @remarks Replaces the entry instead of pushing one, so `Back` does not land on a page
 * the visitor cannot read
 */
export const redirectToLogin = (): void => {
    globalThis.location.replace(
        buildLoginPath(`${globalThis.location.pathname}${globalThis.location.search}`),
    )
}
