import NetInfo from "@react-native-community/netinfo"
import { randomUUID } from "expo-crypto"
import { AppState } from "react-native"

import { api } from "@/lib/api/client"
import { deviceStorage } from "@/lib/storage/device-storage"

import { createSaveSync } from "./save-sync"

export const { flushSaveChanges, syncSaveChange, startSaveSync } = createSaveSync({
    storage: deviceStorage,
    send: (change, deviceId) => {
        const request = {
            params: { eventId: change.eventId, date: change.date },
            body: { deviceId },
        }
        return change.action === "save"
            ? api.saveOccurrence(request)
            : api.unsaveOccurrence(request)
    },
    randomId: randomUUID,
})

/**
 * @description Starts the save sync, and sends the queue again each time the connection comes back or the app returns to the foreground
 * @remarks Needs the device storage loaded, and runs once per launch: each call adds its listeners
 */
export const startDeviceSaveSync = () => {
    void startSaveSync()
    NetInfo.addEventListener(state => {
        if (state.isConnected === true) {
            void flushSaveChanges()
        }
    })
    AppState.addEventListener("change", state => {
        if (state === "active") {
            void flushSaveChanges()
        }
    })
}
