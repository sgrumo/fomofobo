import { describe, expect, it } from "vitest"

import { render, screen } from "../test/test-utils"
import { TickProgress } from "./tick-progress"
import { tickProgressFraction } from "./tick-progress.helper"

describe("TickProgress", () => {
    it("exposes the value, the range and the value text", () => {
        render(
            <TickProgress
                label="Elapsed"
                value={48}
                min={0}
                max={210}
                valueText="21:48"
            />,
        )
        const bar = screen.getByRole("progressbar", { name: "Elapsed" })
        expect(bar).toHaveAttribute("aria-valuenow", "48")
        expect(bar).toHaveAttribute("aria-valuemin", "0")
        expect(bar).toHaveAttribute("aria-valuemax", "210")
        expect(bar).toHaveAttribute("aria-valuetext", "21:48")
    })
})

describe("tickProgressFraction", () => {
    it.each([
        { value: 50, min: 0, max: 200, expected: 0.25 },
        { value: -5, min: 0, max: 10, expected: 0 },
        { value: 15, min: 0, max: 10, expected: 1 },
        { value: 5, min: 10, max: 10, expected: 0 },
        { value: Number.NaN, min: 0, max: 10, expected: 0 },
    ])("returns $expected for $value in $min..$max", ({ value, min, max, expected }) => {
        expect(tickProgressFraction(value, min, max)).toBe(expected)
    })
})
