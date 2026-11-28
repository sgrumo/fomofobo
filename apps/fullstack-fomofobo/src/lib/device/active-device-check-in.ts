import { checkInDateOf, isCheckInDue } from "domain/active-device"

import { api } from "@/lib/api/client-api"
import { localStorage } from "@/lib/storage/local-storage"

import { deviceId } from "./device-id"

/**
 * @description Sends the anonymous check-in of this browser once per local date, and records the date once the API takes it
 * @param now Instant of the use
 */
export const checkInActiveDevice = async (now: Date): Promise<void> => {
    if (!isCheckInDue(localStorage.getItem("active-device-checked-in"), now)) {
        return
    }
    await api.checkInActiveDevice({
        params: {},
        body: { deviceId: deviceId(), platform: "web", appVersion: null },
    })
    localStorage.setItem("active-device-checked-in", checkInDateOf(now))
}
