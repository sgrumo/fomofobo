import { describe, expect, it } from "vitest"

import { getTranslation } from "./translation"

describe("getTranslation", () => {
    it("should translate a shared key in Italian", () => {
        expect(getTranslation("it")("PageTitle.NotFound")).toBe("Pagina non trovata")
    })

    it("should return the same translation for the same language", () => {
        expect(getTranslation("it")("PageTitle.DevSamples")).toBe(
            getTranslation("it")("PageTitle.DevSamples"),
        )
    })
})
