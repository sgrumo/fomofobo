import { describe, expect, it } from "vitest"

import { render, screen } from "../test/test-utils"
import { Meter } from "./meter"

describe("Meter", () => {
    it("renders a meter", () => {
        render(<Meter value={50} min={0} max={100} />)
        expect(screen.getByRole("meter")).toBeInTheDocument()
    })

    it("sets aria-valuenow to the current value", () => {
        render(<Meter value={75} min={0} max={100} />)
        expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "75")
    })

    it("sets aria-valuemin to the min value", () => {
        render(<Meter value={50} min={10} max={100} />)
        expect(screen.getByRole("meter")).toHaveAttribute("aria-valuemin", "10")
    })

    it("sets aria-valuemax to the max value", () => {
        render(<Meter value={50} min={100} max={200} />)
        expect(screen.getByRole("meter")).toHaveAttribute("aria-valuemax", "200")
    })

    it("falls back min to Number.MIN_SAFE_INTEGER when min is NaN", () => {
        render(<Meter value={50} min={Number.NaN} max={100} />)
        expect(screen.getByRole("meter")).toHaveAttribute(
            "aria-valuemin",
            String(Number.MIN_SAFE_INTEGER),
        )
    })

    it("falls back max to Number.MAX_SAFE_INTEGER when max is NaN", () => {
        render(<Meter value={50} min={0} max={Number.NaN} />)
        expect(screen.getByRole("meter")).toHaveAttribute(
            "aria-valuemax",
            String(Number.MAX_SAFE_INTEGER),
        )
    })

    it("falls back value to min when value is NaN", () => {
        render(<Meter value={Number.NaN} min={10} max={100} />)
        expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "10")
    })

    it("falls back value to max when value is Infinity", () => {
        render(<Meter value={Infinity} min={0} max={100} />)
        expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100")
    })

    it("falls back value to min when value is -Infinity", () => {
        render(<Meter value={-Infinity} min={0} max={100} />)
        expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "0")
    })
})
