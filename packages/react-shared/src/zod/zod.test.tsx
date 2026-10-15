import { noop } from "es-toolkit"
import {
    createContext,
    forwardRef,
    lazy,
    memo,
    Profiler,
    StrictMode,
    Suspense,
} from "react"
import { describe, expect, it } from "vitest"
import { ZodError } from "zod"

import { reactElementSchema, reactNodeSchema } from "./zod"

describe("reactElementSchema", () => {
    it("accepts a basic React Element", () => {
        const el = <div />
        expect(() => reactElementSchema.parse(el)).not.toThrow()
    })

    it("accepts Fragment", () => {
        const el = <></>
        expect(() => reactElementSchema.parse(el)).not.toThrow()
    })

    it("accepts StrictMode", () => {
        const el = (
            <StrictMode>
                <div />
            </StrictMode>
        )
        expect(() => reactElementSchema.parse(el)).not.toThrow()
    })

    it("accepts Suspense", () => {
        const el = (
            <Suspense fallback={null}>
                <div />
            </Suspense>
        )
        expect(() => reactElementSchema.parse(el)).not.toThrow()
    })

    it("accepts Profiler", () => {
        const el = (
            <Profiler id="test" onRender={noop}>
                <div />
            </Profiler>
        )
        expect(() => reactElementSchema.parse(el)).not.toThrow()
    })

    it("accepts context provider and consumer", () => {
        const Ctx = createContext<number | null>(null)

        expect(() =>
            reactElementSchema.parse(
                <Ctx.Provider value={1}>
                    <div />
                </Ctx.Provider>,
            ),
        ).not.toThrow()

        expect(() =>
            reactElementSchema.parse(<Ctx.Consumer>{() => <div />}</Ctx.Consumer>),
        ).not.toThrow()
    })

    it("accepts forwardRef components", () => {
        const Comp = forwardRef<HTMLDivElement>((_, ref) => <div ref={ref} />)
        expect(() => reactElementSchema.parse(<Comp />)).not.toThrow()
    })

    it("accepts memo components", () => {
        const Comp = memo(() => <div />)
        expect(() => reactElementSchema.parse(<Comp />)).not.toThrow()
    })

    it("accepts lazy components", () => {
        const Comp = lazy(() =>
            Promise.resolve({
                default: () => <div />,
            }),
        )
        expect(() =>
            reactElementSchema.parse(
                <Suspense fallback={null}>
                    <Comp />
                </Suspense>,
            ),
        ).not.toThrow()
    })

    it("rejects non React Element values", () => {
        expect(() => reactElementSchema.parse({})).toThrow(ZodError)
        expect(() => reactElementSchema.parse("div")).toThrow(ZodError)
        expect(() => reactElementSchema.parse(123)).toThrow(ZodError)
        expect(() => reactElementSchema.parse(null)).toThrow(ZodError)
    })
})

describe("reactNodeSchema", () => {
    it("accepts a single React Element", () => {
        expect(() => reactNodeSchema.parse(<div />)).not.toThrow()
    })

    it.each([
        ["string", "text"],
        ["number", 42],
        ["bigint", 10n],
        ["boolean", true],
        ["null", null],
        ["undefined", undefined],
    ])("accepts %s primitive node", (_label, value) => {
        expect(() => reactNodeSchema.parse(value)).not.toThrow()
    })

    it("accepts arrays of valid React nodes", () => {
        const nodes = [<div key="1" />, "text", 1, false, null, undefined]
        expect(() => reactNodeSchema.parse(nodes)).not.toThrow()
    })

    it("rejects arrays containing invalid values", () => {
        expect(() => reactNodeSchema.parse([<div key="d1" />, {}])).toThrow(ZodError)
    })

    it("rejects unsupported objects", () => {
        expect(() => reactNodeSchema.parse({ foo: "bar" })).toThrow(ZodError)
        expect(() => reactNodeSchema.parse(noop)).toThrow(ZodError)
        expect(() => reactNodeSchema.parse(Symbol("x"))).toThrow(ZodError)
    })
})
