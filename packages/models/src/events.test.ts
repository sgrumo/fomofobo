import { describe, expect, it } from "vitest"

import type { EventUpsert } from "./events"
import { eventExternalLinksSchema, eventUpsertSchema } from "./events"

/**
 * @description Builds a valid event upsert, with the overrides on top
 * @param overrides Fields replaced
 */
const buildEventUpsert = (overrides: Partial<EventUpsert> = {}): EventUpsert => {
    const categoryId = crypto.randomUUID()
    return {
        title: "Jazz al Chiostro",
        description: "Trio acustico",
        categoryIds: [categoryId],
        primaryCategoryId: categoryId,
        venueId: crypto.randomUUID(),
        startsAt: "2026-10-14T21:00",
        endsAt: "2026-10-15T00:30",
        recurrence: null,
        photoKeys: ["events/account/cover.jpg"],
        externalLinks: { instagramUrl: null, facebookUrl: null },
        price: null,
        ...overrides,
    }
}

describe("eventUpsertSchema", () => {
    it("accepts an event from 21:00 to 00:30 of the next day", () => {
        expect(eventUpsertSchema.safeParse(buildEventUpsert()).success).toBe(true)
    })

    it("rejects an end before the start", () => {
        const result = eventUpsertSchema.safeParse(
            buildEventUpsert({ endsAt: "2026-10-14T20:00" }),
        )

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "end-before-start" } },
        ])
    })

    it("rejects a primary category outside the categories", () => {
        const result = eventUpsertSchema.safeParse(
            buildEventUpsert({ primaryCategoryId: crypto.randomUUID() }),
        )

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "primary-category-not-in-list" } },
        ])
    })

    it("rejects a recurrence that ends before the first date", () => {
        const result = eventUpsertSchema.safeParse(
            buildEventUpsert({
                recurrence: {
                    rule: {
                        frequency: "weekly",
                        weekdays: ["wednesday"],
                        until: "2026-10-13",
                    },
                    addedDates: [],
                    removedDates: [],
                },
            }),
        )

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "until-before-first-date" } },
        ])
    })

    it("accepts a recurrence that ends on the first date", () => {
        expect(
            eventUpsertSchema.safeParse(
                buildEventUpsert({
                    recurrence: {
                        rule: {
                            frequency: "monthly",
                            mode: "day-of-month",
                            until: "2026-10-14",
                        },
                        addedDates: [],
                        removedDates: [],
                    },
                }),
            ).success,
        ).toBe(true)
    })

    it("rejects an event with no photo", () => {
        expect(
            eventUpsertSchema.safeParse(buildEventUpsert({ photoKeys: [] })).success,
        ).toBe(false)
    })
})

describe("eventExternalLinksSchema", () => {
    it("accepts the pages of the two networks", () => {
        expect(
            eventExternalLinksSchema.safeParse({
                instagramUrl: "https://www.instagram.com/jazzalchiostro",
                facebookUrl: "https://m.facebook.com/jazzalchiostro",
            }).success,
        ).toBe(true)
    })

    it("rejects a link to another host", () => {
        for (const instagramUrl of [
            "https://instagram.com.evil.example/page",
            "http://www.instagram.com/page",
        ]) {
            expect(
                eventExternalLinksSchema.safeParse({ instagramUrl, facebookUrl: null })
                    .success,
            ).toBe(false)
        }
    })
})
