import type { SaveChange } from "models"
import { describe, expect, it } from "vitest"

import { dropSentSaveChange, queueSaveChange } from "./save-queue"

const concert = { eventId: "7d0c1c3e-5f0a-4f39-9b8e-2f5b9f3d6a10", date: "2026-10-24" }
const market = { eventId: "0b3e9a4d-8c21-4c6f-a1f7-6e2d5c4b3a29", date: "2026-10-25" }

describe("queueSaveChange", () => {
    it("keeps the unsave alone when it follows a save of the same occurrence", () => {
        const pending: SaveChange[] = [
            { ...concert, action: "save" },
            { ...market, action: "save" },
        ]

        expect(queueSaveChange(pending, { ...concert, action: "unsave" })).toStrictEqual([
            { ...market, action: "save" },
            { ...concert, action: "unsave" },
        ])
    })

    it("appends a change of another occurrence", () => {
        expect(
            queueSaveChange([{ ...concert, action: "save" }], {
                ...market,
                action: "unsave",
            }),
        ).toStrictEqual([
            { ...concert, action: "save" },
            { ...market, action: "unsave" },
        ])
    })
})

describe("dropSentSaveChange", () => {
    it("drops the change sent", () => {
        expect(
            dropSentSaveChange(
                [
                    { ...concert, action: "save" },
                    { ...market, action: "save" },
                ],
                { ...concert, action: "save" },
            ),
        ).toStrictEqual([{ ...market, action: "save" }])
    })

    it("keeps a later change that replaced the one sent", () => {
        expect(
            dropSentSaveChange([{ ...concert, action: "unsave" }], {
                ...concert,
                action: "save",
            }),
        ).toStrictEqual([{ ...concert, action: "unsave" }])
    })
})
