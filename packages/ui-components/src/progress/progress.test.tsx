import { describe, expect, it } from "vitest"

import { render, screen } from "../test/test-utils"
import { Progress } from "./progress"

describe("Progress", () => {
    it("renders a progressbar", () => {
        render(<Progress value={50} min={0} max={100} />)
        expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })

    it("sets aria-valuenow when progressing", () => {
        render(<Progress value={75} min={0} max={100} />)
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75")
    })

    it("sets aria-valuemin to the min value", () => {
        render(<Progress value={50} min={10} max={100} />)
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemin", "10")
    })

    it("sets aria-valuemax to the max value", () => {
        render(<Progress value={50} min={0} max={200} />)
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "200")
    })

    it("falls back min to Number.MIN_SAFE_INTEGER when min is NaN", () => {
        render(<Progress value={50} min={Number.NaN} max={100} />)
        expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-valuemin",
            String(Number.MIN_SAFE_INTEGER),
        )
    })

    it("falls back max to Number.MAX_SAFE_INTEGER when max is NaN", () => {
        render(<Progress value={50} min={0} max={Number.NaN} />)
        expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-valuemax",
            String(Number.MAX_SAFE_INTEGER),
        )
    })

    it("falls back value to min when value is NaN", () => {
        render(<Progress value={Number.NaN} min={10} max={100} />)
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10")
    })

    it("falls back value to max when value is Infinity", () => {
        render(<Progress value={Infinity} min={0} max={100} />)
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100")
    })

    it("falls back value to min when value is -Infinity", () => {
        render(<Progress value={-Infinity} min={0} max={100} />)
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0")
    })
})
