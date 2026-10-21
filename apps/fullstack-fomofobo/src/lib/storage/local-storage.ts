import {
    // SAFETY: this is one of the pre-built web storage wrappers
    // oxlint-disable-next-line eslint/no-restricted-imports
    createWebStorage,
    storagePrefix,
} from "frontend-shared/storage"
import { savedEventsStorageSchema } from "models"
import { z } from "zod"

export const localStorageSchema = {
    "dev-quadrant": z.object({
        position: z.enum(["top-left", "top-right", "bottom-left", "bottom-right"]),
        minimized: z.boolean(),
    }),
    "api-delay": z.object({
        base: z.number().min(0),
        jitter: z.number().min(0),
    }),
    "saved-events": savedEventsStorageSchema,
    "event-form-mode": z.enum(["wizard", "form"]),
}
export type LocalStorageKey = keyof typeof localStorageSchema
export type LocalStorageItem<K extends LocalStorageKey> = z.output<
    (typeof localStorageSchema)[K]
>

export const localStorageDefaults: {
    [K in LocalStorageKey]: z.output<(typeof localStorageSchema)[K]>
} = {
    "api-delay": { base: 250, jitter: 50 },
    "dev-quadrant": { position: "bottom-right", minimized: true },
    "saved-events": { version: 1, events: [] },
    "event-form-mode": "wizard",
}

export const localStorage = createWebStorage(
    globalThis.localStorage,
    localStorageSchema,
    localStorageDefaults,
    storagePrefix,
)
