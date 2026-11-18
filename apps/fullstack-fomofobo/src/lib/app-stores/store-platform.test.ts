import { describe, expect, it } from "vitest"

import { storePlatformOf } from "./store-platform"

describe("storePlatformOf", () => {
    it.each([
        {
            device: "an iPhone",
            userAgent:
                "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15",
            maxTouchPoints: 5,
            expected: "ios",
        },
        {
            device: "an iPad in desktop mode",
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
            maxTouchPoints: 5,
            expected: "ios",
        },
        {
            device: "an Android phone",
            userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36",
            maxTouchPoints: 5,
            expected: "android",
        },
        {
            device: "a Mac",
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
            maxTouchPoints: 0,
            expected: undefined,
        },
        {
            device: "a Windows desktop",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            maxTouchPoints: 0,
            expected: undefined,
        },
    ])("picks $expected on $device", ({ userAgent, maxTouchPoints, expected }) => {
        expect(storePlatformOf(userAgent, maxTouchPoints)).toBe(expected)
    })
})
