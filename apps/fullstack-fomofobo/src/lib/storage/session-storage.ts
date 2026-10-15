import {
    // SAFETY: this is one of the pre-built web storage wrappers
    // oxlint-disable-next-line eslint/no-restricted-imports
    createWebStorage,
    storagePrefix,
} from "frontend-shared/storage"
import type { z } from "zod"

export const sessionStorageSchema = {}
export type SessionStorageKey = keyof typeof sessionStorageSchema
export type SessionStorageItem<K extends SessionStorageKey> = z.output<
    (typeof sessionStorageSchema)[K]
>

export const sessionStorageDefaults: {
    [K in SessionStorageKey]: z.output<(typeof sessionStorageSchema)[K]>
} = {}

export const sessionStorage = createWebStorage(
    globalThis.sessionStorage,
    sessionStorageSchema,
    sessionStorageDefaults,
    storagePrefix,
)
