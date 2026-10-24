import { isSameOccurrence } from "domain/save-queue"
import type { OccurrenceRef, SavedEventsStorage } from "models"

/**
 * @description True when the stored list holds the occurrence
 * @param saved Stored list of saved events
 * @param ref Occurrence looked for
 */
export const isSavedOccurrence = (
    saved: SavedEventsStorage,
    ref: OccurrenceRef,
): boolean => saved.events.some(entry => isSameOccurrence(entry, ref))

/**
 * @description Returns the stored list with the occurrence saved at the given instant
 * @param saved Stored list of saved events
 * @param ref Occurrence saved
 * @param savedAt Instant of the save, ISO
 * @remarks Keeps an occurrence already saved with its first instant
 */
export const savedEventsWith = (
    saved: SavedEventsStorage,
    ref: OccurrenceRef,
    savedAt: string,
): SavedEventsStorage =>
    isSavedOccurrence(saved, ref)
        ? saved
        : {
              ...saved,
              events: [
                  ...saved.events,
                  { eventId: ref.eventId, date: ref.date, savedAt },
              ],
          }

/**
 * @description Returns the stored list without the occurrence
 * @param saved Stored list of saved events
 * @param ref Occurrence removed
 */
export const savedEventsWithout = (
    saved: SavedEventsStorage,
    ref: OccurrenceRef,
): SavedEventsStorage => ({
    ...saved,
    events: saved.events.filter(entry => !isSameOccurrence(entry, ref)),
})
