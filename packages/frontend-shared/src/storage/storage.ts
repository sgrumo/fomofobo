import { Result } from "shared/result"
import type { Serializable } from "shared/types"
import { isDefined } from "shared/values"
import type { z } from "zod"

export type WebStorageSetResult<T> = Result<
    T,
    | {
          type: "zod"
          error: z.ZodError<T>
      }
    | {
          type: "serialization"
          error: unknown
      }
    | {
          type: "storage"
          error: unknown
      }
>

export interface WebStorage<
    TKey extends string,
    TStorageSchema extends {
        [TStorageKey in TKey]: z.ZodType<Serializable, unknown>
    },
> {
    listen: (callback: () => void) => () => void
    getRawItem: (key: TKey) => string | null
    parseItem: <TStorageKey extends TKey>(
        key: TStorageKey,
        rawItem: string | null,
    ) => z.output<TStorageSchema[TStorageKey]>
    getItem: <TStorageKey extends TKey>(
        key: TStorageKey,
    ) => z.output<TStorageSchema[TStorageKey]>
    setItem: <TStorageKey extends TKey>(
        key: TStorageKey,
        newItem: z.output<TStorageSchema[TStorageKey]>,
    ) => WebStorageSetResult<z.input<TStorageSchema[TStorageKey]>>
}

/**
 * @description Returns a web storage wrapper validating every item with its schema
 * @template TKey Storage key union
 * @template TStorageSchema Schema map keyed by storage key
 * @param storage Browser storage backing the wrapper
 * @param storageSchema Schema map validating every key
 * @param defaults Values returned when a key is absent or invalid
 * @param prefix Namespace prepended to every key
 * @remarks Falls back to the default value when a read or a parse fails
 */
export const createWebStorage = <
    TKey extends string,
    TStorageSchema extends {
        [TStorageKey in TKey]: z.ZodType<Serializable, unknown>
    },
>(
    storage: Storage,
    storageSchema: TStorageSchema,
    defaults: {
        [TDefaultKey in TKey]: z.output<(typeof storageSchema)[TDefaultKey]>
    },
    prefix: string,
): WebStorage<TKey, TStorageSchema> => {
    const listeners = new Set<() => void>()
    /**
     * @description Returns the unsubscribe function of the registered listener
     * @param callback Listener run after every write
     */
    const listen = (callback: () => void) => {
        listeners.add(callback)
        return () => {
            listeners.delete(callback)
        }
    }

    const prefixedKey = (key: TKey) => `${prefix}:${key}`

    /**
     * @description Returns the stored string, or `null` when absent or unreadable
     * @param key Storage key read
     */
    const getRawItem = (key: TKey): string | null => {
        const read = Result.try(() => storage.getItem(prefixedKey(key)))
        return read.success ? read.value : null
    }

    /**
     * @description Returns the item parsed from its stored string, or the default when
     * absent or invalid
     * @template TStorageKey Storage key type
     * @param key Storage key the string belongs to
     * @param rawItem Stored string, `null` when absent
     */
    const parseItem = <TStorageKey extends TKey>(
        key: TStorageKey,
        rawItem: string | null,
    ): z.output<TStorageSchema[TStorageKey]> => {
        const parsed = Result.try(() =>
            isDefined(rawItem)
                ? storageSchema[key].parse(JSON.parse(rawItem))
                : defaults[key],
        )
        return parsed.success ? parsed.value : defaults[key]
    }

    /**
     * @description Returns the parsed item, or the default when absent or invalid
     * @template TStorageKey Storage key type
     * @param key Storage key read
     */
    const getItem = <TStorageKey extends TKey>(
        key: TStorageKey,
    ): z.output<TStorageSchema[TStorageKey]> => parseItem(key, getRawItem(key))

    /**
     * @description Persists the item, yielding the encoded value or the failure cause
     * @template TStorageKey Storage key type
     * @param key Storage key written
     * @param newItem Value encoded and stored
     * @remarks Notifies every listener only after a successful write
     */
    const setItem = <TStorageKey extends TKey>(
        key: TStorageKey,
        newItem: z.output<TStorageSchema[TStorageKey]>,
    ): WebStorageSetResult<z.input<TStorageSchema[TStorageKey]>> => {
        const encoded = storageSchema[key].safeEncode(newItem)
        if (!encoded.success) {
            return Result.err({
                type: "zod",
                error: encoded.error,
            })
        }

        const serialization = Result.try(() => JSON.stringify(encoded.data))
        if (!serialization.success) {
            return Result.err({
                type: "serialization",
                error: serialization.error,
            })
        }

        const stored = Result.try(() => {
            storage.setItem(prefixedKey(key), serialization.value)
        })
        if (!stored.success) {
            return Result.err({
                type: "storage",
                error: stored.error,
            })
        }

        for (const listener of listeners) {
            Result.try(() => {
                listener()
            })
        }
        return Result.ok(encoded.data)
    }

    return { listen, getRawItem, parseItem, getItem, setItem }
}

export const storagePrefix = "fomofobo"
