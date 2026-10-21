import { describe, expect, it } from "vitest"

import { shareUrlOf } from "./share-urls"

describe("shareUrlOf", () => {
    const shared = {
        url: "https://fomofobo.example/it/events/a/2026-10-24",
        text: "Jazz & più #live",
    }
    const url = "https%3A%2F%2Ffomofobo.example%2Fit%2Fevents%2Fa%2F2026-10-24"
    const text = "Jazz%20%26%20pi%C3%B9%20%23live"

    it.each([
        { target: "whatsapp", expected: `https://wa.me/?text=${text}%20${url}` },
        {
            target: "telegram",
            expected: `https://t.me/share/url?url=${url}&text=${text}`,
        },
        {
            target: "facebook",
            expected: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        },
        { target: "x", expected: `https://x.com/intent/tweet?url=${url}&text=${text}` },
    ] as const)("encodes the link and the text for $target", ({ target, expected }) => {
        expect(shareUrlOf(target, shared)).toBe(expected)
    })
})
