import "server-only"

/**
 * @description Returns the client a rate limit counts: the first address of the `x-forwarded-for` header, which names the client on Vercel
 * @param forwardedFor `x-forwarded-for` header of the request
 */
export const rateLimitClientOf = (forwardedFor: string | undefined): string =>
    forwardedFor?.split(",")[0]?.trim().slice(0, 64) ?? "unknown"
