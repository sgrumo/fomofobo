import { describe, expect, it, vi } from "vitest"

import { installedMapsProvidersOf } from "./maps-provider"

describe("installedMapsProvidersOf", () => {
    it("offers Apple Maps alone on an iPhone with no other maps app", async () => {
        const providers = await installedMapsProvidersOf("ios", () =>
            Promise.resolve(false),
        )

        expect(providers).toStrictEqual(["apple"])
    })

    it("offers Google Maps and Waze on an iPhone that has them", async () => {
        const providers = await installedMapsProvidersOf("ios", () =>
            Promise.resolve(true),
        )

        expect(providers).toStrictEqual(["apple", "google", "waze"])
    })

    it("skips an app whose probe fails", async () => {
        const canOpenUrl = vi
            .fn<(url: string) => Promise<boolean>>()
            .mockResolvedValueOnce(true)
            .mockRejectedValueOnce(new Error("not allowed"))

        const providers = await installedMapsProvidersOf("ios", canOpenUrl)

        expect(canOpenUrl.mock.calls).toStrictEqual([["comgooglemaps://"], ["waze://"]])
        expect(providers).toStrictEqual(["apple", "google"])
    })

    it("offers Google Maps and Waze on Android with no probe", async () => {
        const canOpenUrl = vi.fn<(url: string) => Promise<boolean>>()

        const providers = await installedMapsProvidersOf("android", canOpenUrl)

        expect(canOpenUrl).not.toHaveBeenCalled()
        expect(providers).toStrictEqual(["google", "waze"])
    })
})
