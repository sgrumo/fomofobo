import { act, renderHook } from "@testing-library/react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { useIsClientRender } from "./use-is-client-render"

const Probe = () => <span>{useIsClientRender() ? "client" : "server"}</span>

describe("useIsClientRender", () => {
    it("is false on the server", () => {
        expect(renderToString(<Probe />)).toBe("<span>server</span>")
    })

    it("is true on a client render", () => {
        const { result } = renderHook(() => useIsClientRender())

        expect(result.current).toBe(true)
    })

    it("matches the server markup during hydration, then flips", () => {
        const container = document.createElement("div")
        container.innerHTML = renderToString(<Probe />)

        act(() => {
            hydrateRoot(container, <Probe />)
        })

        expect(container.innerHTML).toBe("<span>client</span>")
    })
})
