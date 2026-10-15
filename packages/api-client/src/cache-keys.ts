export const specifier = {
    detail: "detail",
    list: "list",
}

export const cacheKey = {
    clientCompatibility: "clientCompatibility",
}

/**
 * @remarks Every specific key starts with its `all*` prefix, enabling prefix invalidation
 */
export const cacheKeys = (() => {
    const baseClientCompatibility = [cacheKey.clientCompatibility]

    return {
        // One global query, so the base array is the whole key.
        allClientCompatibility: baseClientCompatibility,
    } as const
})()
