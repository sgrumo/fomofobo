import { localStorage } from "@/lib/storage/local-storage"

/**
 * @description Returns the anonymous id of this browser, created and persisted on the first call
 */
export const deviceId = (): string => {
    const stored = localStorage.getItem("device-id")
    if (stored !== null) {
        return stored
    }
    const created = crypto.randomUUID()
    localStorage.setItem("device-id", created)
    return created
}
