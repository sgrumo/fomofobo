import { describe, expectTypeOf, it } from "vitest"

import type { Action } from "./types"

type FormAction =
    | { type: "title"; value: string | undefined }
    | { type: "count"; value: number | undefined }
    | { type: "reset" }

describe("Action", () => {
    it("selects the member carrying the type", () => {
        expectTypeOf<Action<FormAction, "title">>().toEqualTypeOf<{
            type: "title"
            value: string | undefined
        }>()
        expectTypeOf<Action<FormAction, "reset">>().toEqualTypeOf<{ type: "reset" }>()
    })

    it("selects several members for a union of types", () => {
        expectTypeOf<Action<FormAction, "title" | "count">>().toEqualTypeOf<
            | { type: "title"; value: string | undefined }
            | { type: "count"; value: number | undefined }
        >()
    })

    it("rejects a type outside the union", () => {
        // @ts-expect-error "other" is not a discriminant of FormAction
        expectTypeOf<Action<FormAction, "other">>()
    })

    it("rejects a union without a type discriminant", () => {
        // @ts-expect-error the union members carry no `type`
        expectTypeOf<Action<{ kind: "a" } | { kind: "b" }, "a">>()
    })
})
