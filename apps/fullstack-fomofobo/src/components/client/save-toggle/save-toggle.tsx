"use client"

import type { OccurrenceRef } from "models"
import { useTranslation } from "react-i18next"
import { IconButton } from "ui-components/icon-button"
import { PixelIconSave, PixelIconSaved } from "ui-components/pixel-icons"
import { useToast } from "ui-components/toast"

import { useLocalStorage } from "@/lib/hooks/use-local-storage"

interface SaveToggleProps {
    occurrence: OccurrenceRef
    size?: "sm" | "md"
}

export const SaveToggle = (props: SaveToggleProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const [savedEvents, setSavedEvents] = useLocalStorage("saved-events")
    const { eventId, date } = props.occurrence
    const isSame = (entry: OccurrenceRef) =>
        entry.eventId === eventId && entry.date === date
    const saved = savedEvents.events.some(isSame)

    return (
        <IconButton
            aria-label={t("Saved.Toggle")}
            aria-pressed={saved}
            icon={saved ? <PixelIconSaved /> : <PixelIconSave />}
            tone={saved ? "live" : "surface"}
            size={props.size}
            onClick={() => {
                setSavedEvents({
                    ...savedEvents,
                    events: saved
                        ? savedEvents.events.filter(entry => !isSame(entry))
                        : [
                              ...savedEvents.events,
                              { eventId, date, savedAt: new Date().toISOString() },
                          ],
                })
                toast.add({
                    type: "success",
                    messages: [saved ? t("Saved.Removed") : t("Saved.Added")],
                })
            }}
        />
    )
}
