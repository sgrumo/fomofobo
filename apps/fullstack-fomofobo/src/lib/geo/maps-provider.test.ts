import { describe, expect, it } from "vitest"

import { mapsProviderOf } from "./maps-provider"

describe("mapsProviderOf", () => {
    it.each([
        {
            device: "an iPhone",
            userAgent:
                "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15",
            maxTouchPoints: 5,
            expected: "apple",
        },
        {
            device: "an iPad in desktop mode",
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
            maxTouchPoints: 5,
            expected: "apple",
        },
        {
            device: "a Mac",
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
            maxTouchPoints: 0,
            expected: "google",
        },
        {
            device: "an Android phone",
            userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36",
            maxTouchPoints: 5,
            expected: "google",
        },
    ])("picks $expected on $device", ({ userAgent, maxTouchPoints, expected }) => {
        expect(mapsProviderOf(userAgent, maxTouchPoints)).toBe(expected)
    })
})
