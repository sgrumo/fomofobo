import type { Event } from "models"
import { describe, expect, it } from "vitest"

import { createI18nInstance } from "@/lib/i18n/instance"

import shared from "../../../../public/locales/en/shared.json"
import ui from "../../../../public/locales/en/ui.json"
import {
    eventFormReducer,
    eventFormStateFromEvent,
    eventFormStateToUpsert,
    initialEventFormState,
    localDateTimeOf,
} from "./event-form.state"

const i18n = createI18nInstance("en", { shared, ui })

const MUSIC_ID = "0d3c9e1a-55f4-4a3e-9d0c-6f1b2a3c4d5e"
const JAZZ_ID = "8a7b6c5d-4e3f-4a1b-9c8d-7e6f5a4b3c2d"

/**
 * @description Builds a stored weekly event
 */
const buildEvent = (): Event => ({
    id: crypto.randomUUID(),
    title: "Jazz al chiostro",
    description: null,
    categoryIds: [MUSIC_ID, JAZZ_ID],
    primaryCategoryId: JAZZ_ID,
    venue: {
        id: "2f1e0d9c-8b7a-4f6e-9d5c-4b3a2f1e0d9c",
        name: "Chiostro",
        address: "Via Emilia 1, Imola",
        coordinates: { latitude: 44.35, longitude: 11.71 },
    },
    startsAt: "2026-10-24T21:00",
    endsAt: "2026-10-25T00:30",
    recurrence: {
        rule: { frequency: "weekly", weekdays: ["saturday"], until: "2026-12-19" },
        addedDates: ["2026-12-31"],
        removedDates: ["2026-11-07"],
    },
    photos: [
        {
            id: "5a4b3c2d-1e0f-4a9b-8c7d-6e5f4a3b2c1d",
            url: "https://photos.example.com/events/a/1",
            position: 0,
            key: "events/a/1",
        },
    ],
    externalLinks: {
        instagramUrl: "https://www.instagram.com/chiostro",
        facebookUrl: null,
    },
    price: null,
    organizer: { id: "7c6b5a4d-3e2f-4a1b-8c9d-0e1f2a3b4c5d", name: "Rocca Eventi" },
    isBlocked: false,
    blockReason: null,
    createdAt: "2026-10-16T09:00:00.000Z",
    updatedAt: "2026-10-16T09:00:00.000Z",
})

describe("localDateTimeOf", () => {
    it("joins the calendar day and the wall-clock time", () => {
        expect(
            localDateTimeOf(new Date(2026, 9, 24), {
                hours: 21,
                minutes: 5,
                seconds: 30,
                milliseconds: 0,
            }),
        ).toBe("2026-10-24T21:05")
    })

    it("answers nothing while a part is missing", () => {
        expect(localDateTimeOf(undefined, undefined)).toBeUndefined()
        expect(localDateTimeOf(new Date(2026, 9, 24), undefined)).toBeUndefined()
    })
})

describe("eventFormStateToUpsert", () => {
    it("maps a stored event back to the write that saved it", () => {
        const event = buildEvent()

        const result = eventFormStateToUpsert(eventFormStateFromEvent(event), i18n, {
            isAdmin: false,
        })

        expect(result).toStrictEqual({
            success: true,
            value: {
                title: event.title,
                description: null,
                categoryIds: event.categoryIds,
                primaryCategoryId: event.primaryCategoryId,
                venueId: event.venue.id,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                recurrence: event.recurrence,
                photoKeys: ["events/a/1"],
                externalLinks: event.externalLinks,
                price: null,
                organizerId: undefined,
            },
        })
    })

    it("sends the organizer for an Admin, and requires it", () => {
        const state = eventFormStateFromEvent(buildEvent())

        const withOrganizer = eventFormStateToUpsert(state, i18n, { isAdmin: true })
        const withoutOrganizer = eventFormStateToUpsert(
            { ...state, organizer: undefined },
            i18n,
            { isAdmin: true },
        )

        expect(withOrganizer).toMatchObject({
            success: true,
            value: { organizerId: "7c6b5a4d-3e2f-4a1b-8c9d-0e1f2a3b4c5d" },
        })
        expect(withoutOrganizer).toMatchObject({
            success: false,
            error: { organizer: { errors: [ui.FormErrors.Required] } },
        })
    })

    it("puts the errors of an empty form on its fields", () => {
        const result = eventFormStateToUpsert(initialEventFormState(), i18n, {
            isAdmin: false,
        })

        expect(result).toMatchObject({
            success: false,
            error: {
                title: { errors: [expect.any(String)] },
                categoryIds: { errors: [expect.any(String)] },
                venue: { errors: [expect.any(String)] },
                startDate: { errors: [expect.any(String)] },
                photos: { errors: [expect.any(String)] },
            },
        })
    })
})

describe("eventFormReducer", () => {
    it("keeps the main category while the list holds it, else picks the first one", () => {
        const state = eventFormStateFromEvent(buildEvent())

        const kept = eventFormReducer(state, { type: "category-ids", value: [JAZZ_ID] })
        const replaced = eventFormReducer(state, {
            type: "category-ids",
            value: [MUSIC_ID],
        })

        expect(kept.primaryCategoryId).toBe(JAZZ_ID)
        expect(replaced.primaryCategoryId).toBe(MUSIC_ID)
    })

    it("fills the end date with the start date until it is picked", () => {
        const start = new Date(2026, 9, 24)
        const picked = eventFormReducer(initialEventFormState(), {
            type: "start-date",
            value: start,
        })

        expect(picked.endDate).toStrictEqual(start)
    })
})
