import type { OccurrenceRef } from "models"

import { useDeviceStorage } from "@/lib/hooks/use-device-storage"
import {
    isSavedOccurrence,
    savedEventsWith,
    savedEventsWithout,
} from "@/lib/saves/saved-events"
import { deviceStorage } from "@/lib/storage/device-storage"

/**
 * @description Returns the saved events of the device, with the calls that add and remove one
 */
export const useSavedEvents = () => {
    const [savedEvents] = useDeviceStorage("saved-events")

    return {
        events: savedEvents.events,
        isSaved: (ref: OccurrenceRef) => isSavedOccurrence(savedEvents, ref),
        save: (ref: OccurrenceRef) => {
            deviceStorage.setItem(
                "saved-events",
                savedEventsWith(
                    deviceStorage.getItem("saved-events"),
                    ref,
                    new Date().toISOString(),
                ),
            )
        },
        unsave: (ref: OccurrenceRef) => {
            deviceStorage.setItem(
                "saved-events",
                savedEventsWithout(deviceStorage.getItem("saved-events"), ref),
            )
        },
    }
}
