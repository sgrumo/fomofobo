import "server-only"
import { revalidateTag } from "next/cache"

/** @remarks Tags every cached occurrence detail, so a venue edit or an organizer block expires them all */
export const PUBLIC_TAG = "public"
export const CATEGORIES_TAG = "categories"
export const PLACES_TAG = "places"
export const SETTINGS_TAG = "settings"

/**
 * @description Returns the cache tag of the public reads of one event
 * @param eventId Event tagged
 */
export const eventTag = (eventId: string): string => `event:${eventId}`

/**
 * @description Expires the cached reads of the tags, so the next read misses
 * @param tags Tags expired
 */
export const expireTags = (...tags: string[]): void => {
    for (const tag of tags) {
        revalidateTag(tag, { expire: 0 })
    }
}
