import { describe, expect, it } from "vitest"

import { render, screen } from "../test/test-utils"
import { Timeline } from "./timeline"

describe("Timeline", () => {
    it("renders the progressbar and the three labels", () => {
        render(
            <Timeline
                label="Event time"
                value={48}
                min={0}
                max={210}
                valueText="21:48"
                start="21:00"
                now="Now 21:48"
                end="00:30"
            />,
        )
        expect(screen.getByRole("progressbar", { name: "Event time" })).toHaveAttribute(
            "aria-valuetext",
            "21:48",
        )
        expect(screen.getByText("21:00")).toBeInTheDocument()
        expect(screen.getByText("Now 21:48")).toBeInTheDocument()
        expect(screen.getByText("00:30")).toBeInTheDocument()
    })
})
