import { describe, expect, it } from "vitest"

import { getTranslation } from "./translation"

describe("getTranslation", () => {
    it("should translate a shared key in each language", () => {
        expect(getTranslation("en")("PageTitle.Todos")).toBe("Todos")
        expect(getTranslation("it")("PageTitle.Todos")).toBe("Attività")
    })

    it("should return the same translation for the same language", () => {
        expect(getTranslation("it")("PageTitle.Files")).toBe(
            getTranslation("it")("PageTitle.Files"),
        )
    })
})
