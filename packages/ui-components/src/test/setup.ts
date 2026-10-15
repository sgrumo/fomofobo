import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeAll } from "vitest"

beforeAll(() => {
    // `base-ui` Checkbox calls `new PointerEvent()`, which jsdom does not define.
    Object.defineProperty(globalThis, "PointerEvent", {
        value: MouseEvent,
        writable: true,
        configurable: true,
    })
})
afterEach(() => {
    cleanup()
})
