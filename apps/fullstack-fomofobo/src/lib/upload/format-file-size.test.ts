import { describe, expect, it } from "vitest"

import { formatFileSize } from "./format-file-size"

describe("formatFileSize", () => {
    it("returns bytes with no decimal below one kilobyte", () => {
        expect(formatFileSize(0)).toBe("0 B")
        expect(formatFileSize(1)).toBe("1 B")
        expect(formatFileSize(1023)).toBe("1023 B")
    })

    it("switches unit at every power of 1024", () => {
        expect(formatFileSize(1024)).toBe("1 KB")
        expect(formatFileSize(1024 ** 2)).toBe("1 MB")
        expect(formatFileSize(1024 ** 3)).toBe("1 GB")
    })

    it("rounds to one decimal above the byte unit", () => {
        expect(formatFileSize(1536)).toBe("1.5 KB")
        expect(formatFileSize(1587)).toBe("1.5 KB")
        expect(formatFileSize(2_621_440)).toBe("2.5 MB")
    })

    it("caps the unit at gigabytes", () => {
        expect(formatFileSize(1024 ** 4)).toBe("1024 GB")
        expect(formatFileSize(1024 ** 5)).toBe("1048576 GB")
    })
})
