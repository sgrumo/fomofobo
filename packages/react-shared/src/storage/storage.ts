import { storagePrefix } from "frontend-shared/storage"
import type { WebStorage, WebStorageSetResult } from "frontend-shared/storage"
import { useCallback, useMemo, useSyncExternalStore } from "react"
import type { Serializable } from "shared/types"
import type { z } from "zod"

export { storagePrefix }

/**
 * @description Returns the snapshot of a server render, where no web storage exists
 */
const getServerSnapshot = (): null => null

/**
 * @description Returns a hook reading and writing one key of the web storage
 * @template TKey Storage key union
 * @template TStorageSchema Schema map keyed by storage key
 * @param webStorage Storage instance backing the hook
 * @remarks Uses manual memo hooks because React Compiler skips hook factory returns
 */
export const createUseWebStorage =
    <
        TKey extends string,
        TStorageSchema extends {
            [TStorageKey in TKey]: z.ZodType<Serializable, unknown>
        },
    >(
        webStorage: WebStorage<TKey, TStorageSchema>,
    ) =>
    <TStorageKey extends TKey>(
        key: TStorageKey,
    ): [
        z.output<TStorageSchema[TStorageKey]>,
        (
            newItem: z.output<TStorageSchema[TStorageKey]>,
        ) => WebStorageSetResult<z.input<TStorageSchema[TStorageKey]>>,
    ] => {
        type SchemaOutput = z.output<TStorageSchema[TStorageKey]>
        type SchemaInput = z.input<TStorageSchema[TStorageKey]>

        // Subscribes to the raw item, because the parsed item is referentially unstable.
        const getSnapshot = useCallback(() => webStorage.getRawItem(key), [key])
        const rawItem = useSyncExternalStore(
            webStorage.listen,
            getSnapshot,
            getServerSnapshot,
        )

        const currentItem = useMemo<SchemaOutput>(
            () => webStorage.parseItem(key, rawItem),
            [key, rawItem],
        )

        const setItem = useCallback(
            (newItem: SchemaOutput): WebStorageSetResult<SchemaInput> =>
                webStorage.setItem(key, newItem),
            [key],
        )

        return useMemo<
            [SchemaOutput, (newItem: SchemaOutput) => WebStorageSetResult<SchemaInput>]
        >(() => [currentItem, setItem], [currentItem, setItem])
    }
