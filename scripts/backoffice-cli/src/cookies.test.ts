import { describe, expect, it } from "vitest"

import { mergeCookies } from "./cookies"

describe("mergeCookies", () => {
    it("keeps the name and the value of each set cookie, with no attribute", () => {
        expect(
            mergeCookies("", [
                "fomofobo.session_token=abc.def; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax",
            ]),
        ).toBe("fomofobo.session_token=abc.def")
    })

    it("replaces a sent cookie of the same name and keeps the others", () => {
        expect(
            mergeCookies("fomofobo.session_token=old; other=1", [
                "fomofobo.session_token=new; Path=/",
            ]),
        ).toBe("fomofobo.session_token=new; other=1")
    })

    it("drops a cookie that the response expires", () => {
        expect(
            mergeCookies("fomofobo.session_token=old; other=1", [
                "fomofobo.session_token=; Max-Age=0; Path=/",
                "other=2; max-age=0",
            ]),
        ).toBe("")
    })

    it("keeps a value that holds an equals sign", () => {
        expect(mergeCookies("", ["token=a=b==; Path=/"])).toBe("token=a=b==")
    })
})
