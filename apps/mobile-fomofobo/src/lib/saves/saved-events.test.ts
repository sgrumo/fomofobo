import type { SavedEventsStorage } from "models"
import { describe, expect, it } from "vitest"

import { isSavedOccurrence, savedEventsWith, savedEventsWithout } from "./saved-events"

const concert = { eventId: "7d0c1c3e-5f0a-4f39-9b8e-2f5b9f3d6a10", date: "2026-10-24" }
const market = { eventId: "0b3e9a4d-8c21-4c6f-a1f7-6e2d5c4b3a29", date: "2026-10-25" }
const nextConcert = { ...concert, date: "2026-10-31" }

const stored: SavedEventsStorage = {
    version: 1,
    events: [{ ...concert, savedAt: "2026-10-20T10:00:00.000Z" }],
}

describe("isSavedOccurrence", () => {
    it("matches the event and the date", () => {
        expect(
            [concert, nextConcert, market].map(ref => isSavedOccurrence(stored, ref)),
        ).toStrictEqual([true, false, false])
    })
})

describe("savedEventsWith", () => {
    it("appends the occurrence with the instant of the save", () => {
        expect(savedEventsWith(stored, market, "2026-10-21T09:00:00.000Z")).toStrictEqual(
            {
                version: 1,
                events: [
                    { ...concert, savedAt: "2026-10-20T10:00:00.000Z" },
                    { ...market, savedAt: "2026-10-21T09:00:00.000Z" },
                ],
            },
        )
    })

    it("keeps the first instant of an occurrence already saved", () => {
        expect(
            savedEventsWith(stored, concert, "2026-10-21T09:00:00.000Z"),
        ).toStrictEqual(stored)
    })
})

describe("savedEventsWithout", () => {
    it("removes the occurrence and keeps the other dates of the event", () => {
        const both = savedEventsWith(stored, nextConcert, "2026-10-21T09:00:00.000Z")

        expect(savedEventsWithout(both, concert)).toStrictEqual({
            version: 1,
            events: [{ ...nextConcert, savedAt: "2026-10-21T09:00:00.000Z" }],
        })
    })
})
