import i18n from "i18next"
import { describe, expect, it, vi } from "vitest"

import { nativeI18n } from "./native-i18n"

describe("nativeI18n", () => {
    it("rejects when i18next fails to initialize, then initializes in Italian on the next call", async () => {
        vi.spyOn(i18n, "init").mockRejectedValueOnce(new Error("init failed"))

        await expect(nativeI18n.init()).rejects.toThrow("init failed")
        await nativeI18n.init()

        expect(i18n.language).toBe("it")
        expect(i18n.t("AppError.Retry")).toBe("Riprova")
    })
})
