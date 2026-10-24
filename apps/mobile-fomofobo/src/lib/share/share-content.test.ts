import { describe, expect, it } from "vitest"

import { shareContentOf } from "./share-content"

const shared = {
    url: "https://fomofobo-dev.vercel.app/it/events/c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e01/2026-10-24",
    text: "Jazz al Chiostro · sab 24/10 · 21:00 · Chiostro di San Domenico",
}

describe("shareContentOf", () => {
    it("passes the link apart from the text on iOS", () => {
        expect(shareContentOf("ios", shared)).toStrictEqual({
            url: shared.url,
            message: shared.text,
        })
    })

    it("appends the link to the text on Android", () => {
        expect(shareContentOf("android", shared)).toStrictEqual({
            message: `${shared.text} ${shared.url}`,
        })
    })
})
