import { describe, expect, it } from "vitest"

import { render, screen } from "../test/test-utils"
import { Badge } from "./badge"

describe("Badge", () => {
    it("renders its text", () => {
        render(<Badge tone="live">Live now</Badge>)
        expect(screen.getByText("Live now")).toBeInTheDocument()
    })
})
