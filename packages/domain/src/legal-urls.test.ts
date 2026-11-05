import { describe, expect, it } from "vitest"

import { privacyUrlOf, supportUrlOf } from "./legal-urls"

describe("privacyUrlOf", () => {
    it("builds the URL of the privacy policy page", () => {
        expect(privacyUrlOf("https://fomofobo-dev.vercel.app", "it")).toBe(
            "https://fomofobo-dev.vercel.app/it/privacy",
        )
    })
})

describe("supportUrlOf", () => {
    it("builds the URL of the support page", () => {
        expect(supportUrlOf("https://fomofobo-dev.vercel.app", "it")).toBe(
            "https://fomofobo-dev.vercel.app/it/support",
        )
    })
})
