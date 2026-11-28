import { checkInDateOf, isCheckInDue } from "domain/active-device"
import { nativeApplicationVersion } from "expo-application"
import { randomUUID } from "expo-crypto"
import { AppState, Platform } from "react-native"

import { api } from "@/lib/api/client"
import { deviceStorage } from "@/lib/storage/device-storage"

import { deviceIdOf } from "./device-id"

/**
 * @description Sends the anonymous check-in of the device once per local date, and records the date once the API takes it
 * @param now Instant of the use
 */
const checkInActiveDevice = async (now: Date): Promise<void> => {
    if (!isCheckInDue(deviceStorage.getItem("active-device-checked-in"), now)) {
        return
    }
    await api.checkInActiveDevice({
        params: {},
        body: {
            deviceId: deviceIdOf(deviceStorage, randomUUID),
            platform: Platform.OS === "ios" ? "ios" : "android",
            appVersion: nativeApplicationVersion,
        },
    })
    deviceStorage.setItem("active-device-checked-in", checkInDateOf(now))
}

/**
 * @description Sends the check-in of the day now, and again each time the app returns to the foreground
 * @remarks Needs the device storage loaded, and runs once per launch: each call adds its listener
 */
export const startActiveDeviceCheckIn = (): void => {
    // A failed check-in retries on the next return to the foreground
    const checkIn = () => {
        checkInActiveDevice(new Date()).catch(() => undefined)
    }
    checkIn()
    AppState.addEventListener("change", state => {
        if (state === "active") {
            checkIn()
        }
    })
}
