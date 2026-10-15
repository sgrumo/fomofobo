import { describe, expect, it } from "vitest"

import { render, screen, within } from "../test/test-utils"
import { StatGrid } from "./stat-grid"

describe("StatGrid", () => {
    it("names each cell by its label and holds its value", () => {
        render(
            <StatGrid
                items={[
                    { label: "Date", value: "Wed 14.10" },
                    { label: "Entry", value: "Free" },
                ]}
            />,
        )
        expect(
            within(screen.getByRole("group", { name: "Date" })).getByRole("definition"),
        ).toHaveTextContent("Wed 14.10")
        expect(
            within(screen.getByRole("group", { name: "Entry" })).getByRole("definition"),
        ).toHaveTextContent("Free")
    })
})
