"use client"

import type { OccurrenceRef, OccurrenceSummary } from "models"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IconButton } from "ui-components/icon-button"
import { PixelIconSave, PixelIconSaved } from "ui-components/pixel-icons"

import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { removeSavedSnapshot, storeSavedSnapshots } from "@/lib/pwa/saved-snapshots"
import { syncSaveChange } from "@/lib/saves/save-sync"
import { playSound } from "@/lib/sounds/play-sound"

interface SaveToggleProps {
    occurrence: OccurrenceSummary
    size?: "sm" | "md"
}

export const SaveToggle = (props: SaveToggleProps) => {
    const { t } = useTranslation("shared")
    const [savedEvents, setSavedEvents] = useLocalStorage("saved-events")
    const { eventId, date } = props.occurrence
    const isSame = (entry: OccurrenceRef) =>
        entry.eventId === eventId && entry.date === date
    const saved = savedEvents.events.some(isSame)

    // A saved occurrence on screen refreshes the copy the saved screen lists offline.
    useEffect(() => {
        if (saved) {
            void storeSavedSnapshots([props.occurrence])
        }
    }, [saved, props.occurrence])

    return (
        <IconButton
            aria-label={t("Saved.Toggle")}
            aria-pressed={saved}
            icon={saved ? <PixelIconSaved /> : <PixelIconSave />}
            size={props.size}
            onClick={() => {
                playSound(saved ? "save-off" : "save-on")
                if (saved) {
                    void removeSavedSnapshot(props.occurrence)
                }
                setSavedEvents({
                    ...savedEvents,
                    events: saved
                        ? savedEvents.events.filter(entry => !isSame(entry))
                        : [
                              ...savedEvents.events,
                              { eventId, date, savedAt: new Date().toISOString() },
                          ],
                })
                void syncSaveChange({ eventId, date, action: saved ? "unsave" : "save" })
            }}
        />
    )
}
