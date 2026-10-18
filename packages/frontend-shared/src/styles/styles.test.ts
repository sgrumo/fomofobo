import { describe, expect, it } from "vitest"

import { cn } from "./styles"

describe("cn", () => {
    it("keeps a hard shadow next to a shadow color", () => {
        expect(cn("shadow-hard-md", "shadow-live")).toBe("shadow-hard-md shadow-live")
    })

    it("keeps the last hard shadow size", () => {
        expect(cn("shadow-hard-sm", "shadow-hard-lg")).toBe("shadow-hard-lg")
        expect(cn("shadow-hard-md", "shadow-none")).toBe("shadow-none")
    })

    it("keeps the last hard drop shadow size", () => {
        expect(cn("drop-shadow-hard-sm", "drop-shadow-hard-lg")).toBe(
            "drop-shadow-hard-lg",
        )
    })

    it("keeps the last typography utility", () => {
        expect(cn("tp-body-md", "tp-pixel-md")).toBe("tp-pixel-md")
    })

    it("keeps a typography utility next to a text color", () => {
        expect(cn("tp-pixel-sm", "text-fg-muted")).toBe("tp-pixel-sm text-fg-muted")
    })
})
