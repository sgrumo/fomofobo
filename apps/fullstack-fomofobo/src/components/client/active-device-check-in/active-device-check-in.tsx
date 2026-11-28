"use client"

import { useEffect } from "react"

import { checkInActiveDevice } from "@/lib/device/active-device-check-in"

/**
 * @description Sends the check-in of the day on load and each time the page shows again, as a tab left open overnight counts on the next day
 */
const checkIn = () => {
    // A failed check-in retries on the next load or show of the page
    checkInActiveDevice(new Date()).catch(() => undefined)
}

export const ActiveDeviceCheckIn = () => {
    useEffect(() => {
        checkIn()
        const checkInWhenShown = () => {
            if (document.visibilityState === "visible") {
                checkIn()
            }
        }
        document.addEventListener("visibilitychange", checkInWhenShown)
        return () => {
            document.removeEventListener("visibilitychange", checkInWhenShown)
        }
    }, [])

    return undefined
}
