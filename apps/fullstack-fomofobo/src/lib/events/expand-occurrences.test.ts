import { err, map, ok } from "shared/result"
import { describe, expect, it } from "vitest"

import { expandOccurrences } from "./expand-occurrences"
import type { ExpandedOccurrence } from "./expand-occurrences"

const ROME = "Europe/Rome"

describe("expandOccurrences", () => {
    it("yields one occurrence for a single event", () => {
        expect(
            expandOccurrences(
                {
                    startsAt: "2026-10-17T21:00",
                    endsAt: "2026-10-18T00:30",
                    recurrence: null,
                },
                ROME,
            ),
        ).toStrictEqual(
            ok([
                {
                    localDate: "2026-10-17",
                    startsAt: new Date("2026-10-17T19:00:00Z"),
                    endsAt: new Date("2026-10-17T22:30:00Z"),
                },
            ]),
        )
    })

    it("keeps 21:00 local across the October DST change", () => {
        expect(
            expandOccurrences(
                {
                    startsAt: "2026-10-17T21:00",
                    endsAt: "2026-10-18T00:30",
                    recurrence: {
                        rule: {
                            frequency: "weekly",
                            weekdays: ["saturday"],
                            until: "2026-10-31",
                        },
                        addedDates: [],
                        removedDates: [],
                    },
                },
                ROME,
            ),
        ).toStrictEqual(
            ok([
                {
                    localDate: "2026-10-17",
                    startsAt: new Date("2026-10-17T19:00:00Z"),
                    endsAt: new Date("2026-10-17T22:30:00Z"),
                },
                {
                    localDate: "2026-10-24",
                    startsAt: new Date("2026-10-24T19:00:00Z"),
                    endsAt: new Date("2026-10-24T22:30:00Z"),
                },
                {
                    localDate: "2026-10-31",
                    startsAt: new Date("2026-10-31T20:00:00Z"),
                    endsAt: new Date("2026-10-31T23:30:00Z"),
                },
            ]),
        )
    })

    it("moves a start inside the March DST gap one hour forward", () => {
        expect(
            expandOccurrences(
                {
                    startsAt: "2026-03-29T02:30",
                    endsAt: "2026-03-29T04:00",
                    recurrence: null,
                },
                ROME,
            ),
        ).toStrictEqual(
            ok([
                {
                    localDate: "2026-03-29",
                    startsAt: new Date("2026-03-29T01:30:00Z"),
                    endsAt: new Date("2026-03-29T02:00:00Z"),
                },
            ]),
        )
    })

    it("ends at the start when the moved start passes an end after the DST gap", () => {
        expect(
            expandOccurrences(
                {
                    startsAt: "2026-03-29T02:30",
                    endsAt: "2026-03-29T03:15",
                    recurrence: null,
                },
                ROME,
            ),
        ).toStrictEqual(
            ok([
                {
                    localDate: "2026-03-29",
                    startsAt: new Date("2026-03-29T01:30:00Z"),
                    endsAt: new Date("2026-03-29T01:30:00Z"),
                },
            ]),
        )
    })

    it("skips the months without a 31st on a monthly day-of-month rule", () => {
        const result = expandOccurrences(
            {
                startsAt: "2027-01-31T18:00",
                endsAt: "2027-01-31T20:00",
                recurrence: {
                    rule: {
                        frequency: "monthly",
                        mode: "day-of-month",
                        until: "2027-05-31",
                    },
                    addedDates: [],
                    removedDates: [],
                },
            },
            ROME,
        )

        expect(
            map((occurrences: ExpandedOccurrence[]) =>
                occurrences.map(occurrence => occurrence.localDate),
            )(result),
        ).toStrictEqual(ok(["2027-01-31", "2027-03-31", "2027-05-31"]))
    })

    it("skips the months without a fifth Wednesday on a monthly weekday-position rule", () => {
        const result = expandOccurrences(
            {
                startsAt: "2026-09-30T18:00",
                endsAt: "2026-09-30T20:00",
                recurrence: {
                    rule: {
                        frequency: "monthly",
                        mode: "weekday-position",
                        until: "2027-03-31",
                    },
                    addedDates: [],
                    removedDates: [],
                },
            },
            ROME,
        )

        expect(
            map((occurrences: ExpandedOccurrence[]) =>
                occurrences.map(occurrence => occurrence.localDate),
            )(result),
        ).toStrictEqual(ok(["2026-09-30", "2026-12-30", "2027-03-31"]))
    })

    it("keeps a first date off the weekly weekdays", () => {
        const result = expandOccurrences(
            {
                startsAt: "2026-10-16T21:00",
                endsAt: "2026-10-16T23:00",
                recurrence: {
                    rule: {
                        frequency: "weekly",
                        weekdays: ["saturday"],
                        until: "2026-10-24",
                    },
                    addedDates: [],
                    removedDates: [],
                },
            },
            ROME,
        )

        expect(
            map((occurrences: ExpandedOccurrence[]) =>
                occurrences.map(occurrence => occurrence.localDate),
            )(result),
        ).toStrictEqual(ok(["2026-10-16", "2026-10-17", "2026-10-24"]))
    })

    it("drops a removed date and adds an added date outside the rule", () => {
        const result = expandOccurrences(
            {
                startsAt: "2026-10-17T21:00",
                endsAt: "2026-10-17T23:00",
                recurrence: {
                    rule: {
                        frequency: "weekly",
                        weekdays: ["saturday"],
                        until: "2026-10-31",
                    },
                    addedDates: ["2026-10-20"],
                    removedDates: ["2026-10-24"],
                },
            },
            ROME,
        )

        expect(
            map((occurrences: ExpandedOccurrence[]) =>
                occurrences.map(occurrence => occurrence.localDate),
            )(result),
        ).toStrictEqual(ok(["2026-10-17", "2026-10-20", "2026-10-31"]))
    })

    it("yields one occurrence for an added date that the rule already yields", () => {
        const result = expandOccurrences(
            {
                startsAt: "2026-10-17T21:00",
                endsAt: "2026-10-17T23:00",
                recurrence: {
                    rule: {
                        frequency: "weekly",
                        weekdays: ["saturday"],
                        until: "2026-10-31",
                    },
                    addedDates: ["2026-10-24"],
                    removedDates: [],
                },
            },
            ROME,
        )

        expect(
            map((occurrences: ExpandedOccurrence[]) =>
                occurrences.map(occurrence => occurrence.localDate),
            )(result),
        ).toStrictEqual(ok(["2026-10-17", "2026-10-24", "2026-10-31"]))
    })

    it("fails one occurrence past the limit", () => {
        expect(
            expandOccurrences(
                {
                    startsAt: "2026-01-01T10:00",
                    endsAt: "2026-01-01T12:00",
                    recurrence: {
                        rule: {
                            frequency: "weekly",
                            weekdays: [
                                "sunday",
                                "monday",
                                "tuesday",
                                "wednesday",
                                "thursday",
                                "friday",
                                "saturday",
                            ],
                            until: "2027-01-02",
                        },
                        addedDates: [],
                        removedDates: [],
                    },
                },
                ROME,
            ),
        ).toStrictEqual(err("too-many-occurrences"))
    })

    it("fails a monthly rule that runs for a century", () => {
        expect(
            expandOccurrences(
                {
                    startsAt: "2026-01-15T10:00",
                    endsAt: "2026-01-15T12:00",
                    recurrence: {
                        rule: {
                            frequency: "monthly",
                            mode: "day-of-month",
                            until: "2126-01-15",
                        },
                        addedDates: [],
                        removedDates: [],
                    },
                },
                ROME,
            ),
        ).toStrictEqual(err("too-many-occurrences"))
    })
})
