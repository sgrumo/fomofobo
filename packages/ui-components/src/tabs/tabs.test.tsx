import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { render, screen } from "../test/test-utils"
import { TabsRoot, TabsList, TabsPanel, TabsTab } from "./tabs"

describe("Tabs", () => {
    it("renders tabs and shows default panel", () => {
        render(
            <TabsRoot defaultValue="a">
                <TabsList>
                    <TabsTab value="a">Tab A</TabsTab>
                    <TabsTab value="b">Tab B</TabsTab>
                </TabsList>
                <TabsPanel value="a">Content A</TabsPanel>
                <TabsPanel value="b">Content B</TabsPanel>
            </TabsRoot>,
        )

        expect(screen.getByRole("tab", { name: "Tab A" })).toHaveAttribute(
            "aria-selected",
            "true",
        )
        expect(screen.getByText("Content A")).toBeInTheDocument()
    })

    it("switches panel when tab is clicked", async () => {
        const user = userEvent.setup()

        render(
            <TabsRoot defaultValue="a">
                <TabsList>
                    <TabsTab value="a">Tab A</TabsTab>
                    <TabsTab value="b">Tab B</TabsTab>
                </TabsList>
                <TabsPanel value="a">Content A</TabsPanel>
                <TabsPanel value="b">Content B</TabsPanel>
            </TabsRoot>,
        )

        await user.click(screen.getByRole("tab", { name: "Tab B" }))

        expect(screen.getByRole("tab", { name: "Tab B" })).toHaveAttribute(
            "aria-selected",
            "true",
        )
        expect(screen.getByRole("tab", { name: "Tab A" })).toHaveAttribute(
            "aria-selected",
            "false",
        )
        expect(screen.getByText("Content B")).toBeInTheDocument()
    })

    it("calls onValueChange when tab is clicked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: string | number) => void>()

        render(
            <TabsRoot defaultValue="a" onValueChange={handleValueChange}>
                <TabsList>
                    <TabsTab value="a">Tab A</TabsTab>
                    <TabsTab value="b">Tab B</TabsTab>
                </TabsList>
                <TabsPanel value="a">Content A</TabsPanel>
                <TabsPanel value="b">Content B</TabsPanel>
            </TabsRoot>,
        )

        await user.click(screen.getByRole("tab", { name: "Tab B" }))

        expect(handleValueChange).toHaveBeenCalledWith("b", expect.anything())
    })

    it("does not switch to a disabled tab", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: string | number) => void>()

        render(
            <TabsRoot defaultValue="a" onValueChange={handleValueChange}>
                <TabsList>
                    <TabsTab value="a">Tab A</TabsTab>
                    <TabsTab value="b" disabled={true}>
                        Tab B
                    </TabsTab>
                </TabsList>
                <TabsPanel value="a">Content A</TabsPanel>
                <TabsPanel value="b">Content B</TabsPanel>
            </TabsRoot>,
        )

        await user.click(screen.getByRole("tab", { name: "Tab B" }))

        expect(handleValueChange).not.toHaveBeenCalled()
        expect(screen.getByRole("tab", { name: "Tab A" })).toHaveAttribute(
            "aria-selected",
            "true",
        )
    })

    it("works in controlled mode", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: string | number) => void>()

        render(
            <TabsRoot value="a" onValueChange={handleValueChange}>
                <TabsList>
                    <TabsTab value="a">Tab A</TabsTab>
                    <TabsTab value="b">Tab B</TabsTab>
                </TabsList>
                <TabsPanel value="a">Content A</TabsPanel>
                <TabsPanel value="b">Content B</TabsPanel>
            </TabsRoot>,
        )

        expect(screen.getByText("Content A")).toBeInTheDocument()

        await user.click(screen.getByRole("tab", { name: "Tab B" }))

        expect(handleValueChange).toHaveBeenCalledWith("b", expect.anything())
    })
})
