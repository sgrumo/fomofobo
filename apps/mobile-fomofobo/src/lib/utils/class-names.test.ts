import { describe, expect, it } from "vitest"

import { cn } from "./class-names"

describe("cn", () => {
    it("keeps the last type scale utility", () => {
        expect(cn("tp-body-lg", "tp-pixel-md")).toBe("tp-pixel-md")
    })

    it("keeps a type scale utility next to a text color", () => {
        expect(cn("tp-pixel-sm", "text-fg-muted")).toBe("tp-pixel-sm text-fg-muted")
    })
})
