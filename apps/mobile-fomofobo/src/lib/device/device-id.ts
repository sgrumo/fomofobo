import type { WebStorage } from "frontend-shared/storage"

import type { DeviceStorageKey, deviceStorageSchema } from "@/lib/storage/storage-keys"

/**
 * @description Returns the anonymous id of the device, created and persisted on the first call
 * @param storage Device storage that keeps the id
 * @param randomId Source of a new id
 */
export const deviceIdOf = (
    storage: WebStorage<DeviceStorageKey, typeof deviceStorageSchema>,
    randomId: () => string,
): string => {
    const stored = storage.getItem("device-id")
    if (stored !== null) {
        return stored
    }
    const created = randomId()
    storage.setItem("device-id", created)
    return created
}
