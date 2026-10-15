import { assertType, describe, expectTypeOf, it } from "vitest"

import type {
    All,
    Any,
    EmptyObject,
    Extends,
    ListHead,
    ListItems,
    ListTail,
    Literals,
    Not,
    Partial,
    Paths,
    Require,
    Select,
    Simplify,
    Specified,
    StrictExclude,
    StrictOmit,
    StringContainsAdjacentMultiple,
    StringEndsWith,
    SubPaths,
} from "./types"

describe("EmptyObject", () => {
    it("accepts empty object", () => {
        assertType<EmptyObject>({})
    })

    it("rejects objects with properties", () => {
        // @ts-expect-error EmptyObject does not accept properties
        assertType<EmptyObject>({ a: 1 })
    })
})

interface Address {
    street: string
    zip?: string
}
interface Tag {
    label: string
    weight?: number
}
interface Person {
    name: string
    nickname?: string
    address?: Address
    tags: Tag[]
    createdAt: Date
    greet: () => void
}
interface Tree {
    value: number
    children: Tree[]
}

describe("Simplify", () => {
    it("flattens an intersection into one object, keeping modifiers", () => {
        expectTypeOf<Simplify<{ a: string } & { b?: number }>>().toEqualTypeOf<{
            a: string
            b?: number
        }>()
    })
})

describe("Paths", () => {
    it("lists top-level keys", () => {
        expectTypeOf<Paths<{ a: string; b: number }>>().toEqualTypeOf<"a" | "b">()
    })

    it("lists nested keys as dotted paths", () => {
        expectTypeOf<Paths<{ a: { b: { c: string } } }>>().toEqualTypeOf<
            "a" | "a.b" | "a.b.c"
        >()
    })

    it("lists array items as [N]", () => {
        expectTypeOf<Paths<{ tags: Array<{ label: string }> }>>().toEqualTypeOf<
            "tags" | "tags.[N]" | "tags.[N].label"
        >()
        expectTypeOf<Paths<ReadonlyArray<{ id: string }>>>().toEqualTypeOf<
            "[N]" | "[N].id"
        >()
    })

    it("walks through optional properties", () => {
        expectTypeOf<Paths<{ a?: { b?: string } }>>().toEqualTypeOf<"a" | "a.b">()
    })

    it("merges the paths of every union member", () => {
        expectTypeOf<
            Paths<{ kind: "a"; left: string } | { kind: "b"; right: { deep: number } }>
        >().toEqualTypeOf<"kind" | "left" | "right" | "right.deep">()
        expectTypeOf<Paths<{ a: string } | null | undefined>>().toEqualTypeOf<"a">()
    })

    it("treats primitives, dates and functions as leaves", () => {
        expectTypeOf<Paths<string>>().toEqualTypeOf<never>()
        expectTypeOf<Paths<Date>>().toEqualTypeOf<never>()
        expectTypeOf<Paths<Person>>().toEqualTypeOf<
            | "name"
            | "nickname"
            | "address"
            | "address.street"
            | "address.zip"
            | "tags"
            | "tags.[N]"
            | "tags.[N].label"
            | "tags.[N].weight"
            | "createdAt"
            | "greet"
        >()
    })

    it("stops on a recursive type", () => {
        expectTypeOf<Paths<Tree>>().toExtend<string>()
        expectTypeOf<"children.[N].children.[N].value">().toExtend<Paths<Tree>>()
    })
})

describe("SubPaths", () => {
    it("strips the matched segment", () => {
        expectTypeOf<SubPaths<"a" | "a.b" | "a.b.c" | "x.y", "a">>().toEqualTypeOf<
            "b" | "b.c"
        >()
    })

    it("matches the whole segment only", () => {
        expectTypeOf<SubPaths<"ab.c", "a">>().toEqualTypeOf<never>()
    })

    it("matches the array item segment", () => {
        expectTypeOf<SubPaths<"[N]" | "[N].label", "[N]">>().toEqualTypeOf<"label">()
    })

    it("yields never without nested paths", () => {
        expectTypeOf<SubPaths<"a" | "b", "a">>().toEqualTypeOf<never>()
        expectTypeOf<SubPaths<never, "a">>().toEqualTypeOf<never>()
    })
})

describe("Specified", () => {
    it("makes every optional property required, keeping undefined in the value", () => {
        type TypeInput = { a?: string; b?: number; c: boolean }
        expectTypeOf<Specified<TypeInput>>().toEqualTypeOf<{
            a: string | undefined
            b: number | undefined
            c: boolean
        }>()

        interface InterfaceInput {
            a?: string
            b?: number
        }
        expectTypeOf<Specified<InterfaceInput>>().toEqualTypeOf<{
            a: string | undefined
            b: number | undefined
        }>()
    })

    it("recurses by default", () => {
        expectTypeOf<Specified<{ a?: { b?: string } }>>().toEqualTypeOf<{
            a: { b: string | undefined } | undefined
        }>()
    })

    it("stops at the first level in shallow mode", () => {
        expectTypeOf<
            Specified<{ a?: { b?: string } }, { mode: "shallow" }>
        >().toEqualTypeOf<{
            a: { b?: string } | undefined
        }>()
    })

    it("walks into arrays in both modes", () => {
        expectTypeOf<Specified<Array<{ a?: string }>>>().toEqualTypeOf<
            Array<{ a: string | undefined }>
        >()
        expectTypeOf<
            Specified<Array<{ a?: string }>, { mode: "shallow" }>
        >().toEqualTypeOf<Array<{ a: string | undefined }>>()
        expectTypeOf<Specified<ReadonlyArray<{ a?: string }>>>().toEqualTypeOf<
            ReadonlyArray<{ a: string | undefined }>
        >()
    })

    it("does not walk into an array held by a property in shallow mode", () => {
        expectTypeOf<
            Specified<{ tags?: Array<{ a?: string }> }, { mode: "shallow" }>
        >().toEqualTypeOf<{ tags: Array<{ a?: string }> | undefined }>()
    })

    it("transforms every union member", () => {
        expectTypeOf<Specified<{ a?: string } | { b?: number }>>().toEqualTypeOf<
            { a: string | undefined } | { b: number | undefined }
        >()
        expectTypeOf<Specified<{ a?: { b?: string } | null }>>().toEqualTypeOf<{
            a: { b: string | undefined } | null | undefined
        }>()
    })

    it("passes through leaves unchanged", () => {
        expectTypeOf<Specified<string>>().toEqualTypeOf<string>()
        expectTypeOf<Specified<number>>().toEqualTypeOf<number>()
        expectTypeOf<Specified<{ at?: Date; fn?: () => void }>>().toEqualTypeOf<{
            at: Date | undefined
            fn: (() => void) | undefined
        }>()
    })

    it("keeps an excluded top-level key as declared", () => {
        expectTypeOf<
            Specified<{ a?: string; b?: { c?: string } }, { exclude: "b" }>
        >().toEqualTypeOf<{ a: string | undefined; b?: { c?: string } }>()
    })

    it("keeps an excluded nested path as declared", () => {
        expectTypeOf<
            Specified<{ a?: { b?: string; c?: { d?: string } } }, { exclude: "a.c" }>
        >().toEqualTypeOf<{
            a: { b: string | undefined; c?: { d?: string } } | undefined
        }>()
    })

    it("keeps an excluded array item field as declared", () => {
        expectTypeOf<
            Specified<
                { tags: Array<{ label?: string; weight?: number }> },
                { exclude: "tags.[N].weight" }
            >
        >().toEqualTypeOf<{
            tags: Array<{ label: string | undefined; weight?: number }>
        }>()
        expectTypeOf<
            Specified<{ tags?: Array<{ label?: string }> }, { exclude: "tags.[N]" }>
        >().toEqualTypeOf<{ tags: Array<{ label?: string }> | undefined }>()
    })

    it("accepts several excluded paths", () => {
        expectTypeOf<
            Specified<
                { a?: string; b?: string; c?: { d?: string } },
                { exclude: "a" | "c.d" }
            >
        >().toEqualTypeOf<{
            a?: string
            b: string | undefined
            c: { d?: string } | undefined
        }>()
    })

    it("rejects an unknown excluded path", () => {
        // @ts-expect-error "x" is not a path of the input
        expectTypeOf<Specified<{ a?: string }, { exclude: "x" }>>()
        // @ts-expect-error "a.b" goes through a leaf
        expectTypeOf<Specified<{ a?: string }, { exclude: "a.b" }>>()
        // @ts-expect-error array items are addressed with "[N]"
        expectTypeOf<Specified<{ tags: string[] }, { exclude: "tags.0" }>>()
    })

    it("rejects an unknown mode", () => {
        // @ts-expect-error mode is "deep" or "shallow"
        expectTypeOf<Specified<{ a?: string }, { mode: "flat" }>>()
    })
})

describe("Partial", () => {
    it("makes every property optional", () => {
        type TypeInput = { a: string; b?: number }
        expectTypeOf<Partial<TypeInput>>().toEqualTypeOf<{ a?: string; b?: number }>()

        interface InterfaceInput {
            a: string
            b?: number
        }
        expectTypeOf<Partial<InterfaceInput>>().toEqualTypeOf<{
            a?: string
            b?: number
        }>()
    })

    it("recurses by default", () => {
        expectTypeOf<Partial<{ a: { b: string } }>>().toEqualTypeOf<{
            a?: { b?: string }
        }>()
    })

    it("stops at the first level in shallow mode", () => {
        expectTypeOf<Partial<{ a: { b: string } }, { mode: "shallow" }>>().toEqualTypeOf<{
            a?: { b: string }
        }>()
    })

    it("walks into arrays in both modes", () => {
        expectTypeOf<Partial<Array<{ a: string }>>>().toEqualTypeOf<
            Array<{ a?: string }>
        >()
        expectTypeOf<Partial<Array<{ a: string }>, { mode: "shallow" }>>().toEqualTypeOf<
            Array<{ a?: string }>
        >()
    })

    it("transforms every union member", () => {
        expectTypeOf<Partial<{ a: string } | { b: number }>>().toEqualTypeOf<
            { a?: string } | { b?: number }
        >()
    })

    it("passes through leaves unchanged", () => {
        expectTypeOf<Partial<string>>().toEqualTypeOf<string>()
        expectTypeOf<Partial<{ at: Date }>>().toEqualTypeOf<{ at?: Date }>()
    })

    it("keeps an excluded path as declared", () => {
        expectTypeOf<
            Partial<
                { a: string; b: { c: string; d: { e: string } } },
                { exclude: "a" | "b.d" }
            >
        >().toEqualTypeOf<{ a: string; b?: { c?: string; d: { e: string } } }>()
        expectTypeOf<
            Partial<
                { tags: Array<{ label: string; weight: number }> },
                { exclude: "tags.[N].weight" }
            >
        >().toEqualTypeOf<{ tags?: Array<{ label?: string; weight: number }> }>()
    })

    it("rejects an unknown excluded path", () => {
        // @ts-expect-error "x" is not a path of the input
        expectTypeOf<Partial<{ a: string }, { exclude: "x" }>>()
    })

    it("composes with Specified into the form conversion shape", () => {
        expectTypeOf<Specified<Partial<Person>>>().toEqualTypeOf<{
            name: string | undefined
            nickname: string | undefined
            address: { street: string | undefined; zip: string | undefined } | undefined
            tags:
                | Array<{ label: string | undefined; weight: number | undefined }>
                | undefined
            createdAt: Date | undefined
            greet: (() => void) | undefined
        }>()
    })
})

describe("StrictOmit", () => {
    it("omits a key from a type", () => {
        type TypeInput = { a: string; b: number; c: boolean }
        expectTypeOf<StrictOmit<TypeInput, "a">>().toEqualTypeOf<{
            b: number
            c: boolean
        }>()

        interface InterfaceInput {
            a: string
            b: number
            c: boolean
        }
        expectTypeOf<StrictOmit<InterfaceInput, "a">>().toEqualTypeOf<{
            b: number
            c: boolean
        }>()
    })

    it("only accepts valid keys", () => {
        type TypeInput = { a: string; b: number }
        // @ts-expect-error "c" is not a key of Input
        expectTypeOf<StrictOmit<TypeInput, "c">>()

        interface InterfaceInput {
            a: string
            b: number
        }
        // @ts-expect-error "c" is not a key of Input
        expectTypeOf<StrictOmit<InterfaceInput, "c">>()
    })
})

describe("StrictExclude", () => {
    it("excludes a member from a union", () => {
        expectTypeOf<StrictExclude<"a" | "b" | "c", "a">>().toEqualTypeOf<"b" | "c">()
    })

    it("only accepts valid union members", () => {
        // @ts-expect-error "d" is not a member of the union
        expectTypeOf<StrictExclude<"a" | "b" | "c", "d">>()
    })
})

describe("Require", () => {
    it("makes specified optional properties required", () => {
        type TypeInput = { a?: string; b?: number; c: boolean }
        expectTypeOf<TypeInput["a"]>().toEqualTypeOf<string | undefined>()
        expectTypeOf<Require<TypeInput, "a">["a"]>().toEqualTypeOf<string>()

        interface InterfaceInput {
            a?: string
            b?: number
            c: boolean
        }
        expectTypeOf<InterfaceInput["a"]>().toEqualTypeOf<string | undefined>()
        expectTypeOf<Require<InterfaceInput, "a">["a"]>().toEqualTypeOf<string>()
    })

    it("makes multiple properties required", () => {
        type TypeInput = { a?: string; b?: number; c?: boolean }
        type RequiredTypeInput = Require<TypeInput, "a" | "b">
        expectTypeOf<TypeInput["a"] | TypeInput["b"]>().toEqualTypeOf<
            string | number | undefined
        >()
        expectTypeOf<RequiredTypeInput["a"] | RequiredTypeInput["b"]>().toEqualTypeOf<
            string | number
        >()

        interface InterfaceInput {
            a?: string
            b?: number
            c?: boolean
        }
        type RequiredInterfaceInput = Require<InterfaceInput, "a" | "b">
        expectTypeOf<InterfaceInput["a"] | InterfaceInput["b"]>().toEqualTypeOf<
            string | number | undefined
        >()
        expectTypeOf<
            RequiredInterfaceInput["a"] | RequiredInterfaceInput["b"]
        >().toEqualTypeOf<string | number>()
    })
})

describe("Select", () => {
    it("selects a subtype from a union", () => {
        expectTypeOf<Select<string | number, string>>().toEqualTypeOf<string>()
    })

    it("only accepts valid subtypes", () => {
        // @ts-expect-error boolean is not a member of string | number
        expectTypeOf<Select<string | number, boolean>>()
    })
})

describe("Literals", () => {
    it("drops the string that opens a union", () => {
        expectTypeOf<
            Literals<"a" | "b" | (string & Record<never, never>)>
        >().toEqualTypeOf<"a" | "b">()
    })

    it("keeps a closed union", () => {
        expectTypeOf<Literals<"a" | "b">>().toEqualTypeOf<"a" | "b">()
    })

    it("yields never for a union that holds no string literal", () => {
        expectTypeOf<
            Literals<number | (string & Record<never, never>)>
        >().toEqualTypeOf<never>()
    })
})

describe("ListItems", () => {
    it("extracts element type from an array", () => {
        expectTypeOf<ListItems<string[]>>().toEqualTypeOf<string>()
        expectTypeOf<ListItems<Array<number | boolean>>>().toEqualTypeOf<
            number | boolean
        >()
    })

    it("returns never for empty tuple", () => {
        expectTypeOf<ListItems<[]>>().toEqualTypeOf<never>()
    })
})

describe("ListHead", () => {
    it("extracts the first element type from a tuple", () => {
        expectTypeOf<ListHead<[string, number, boolean]>>().toEqualTypeOf<string>()
    })

    it("returns never for empty tuple", () => {
        expectTypeOf<ListHead<[]>>().toEqualTypeOf<never>()
    })
})

describe("ListTail", () => {
    it("extracts all but the first element type from a tuple", () => {
        expectTypeOf<ListTail<[string, number, boolean]>>().toEqualTypeOf<
            [number, boolean]
        >()
    })

    it("returns empty tuple for single-element tuple", () => {
        expectTypeOf<ListTail<[string]>>().toEqualTypeOf<[]>()
    })

    it("returns never for empty tuple", () => {
        expectTypeOf<ListTail<[]>>().toEqualTypeOf<never>()
    })
})

describe("Extends", () => {
    it("returns true when T extends U", () => {
        expectTypeOf<Extends<string, string>>().toEqualTypeOf<true>()
        expectTypeOf<Extends<"literal", string>>().toEqualTypeOf<true>()
    })

    it("returns false when T does not extend U", () => {
        expectTypeOf<Extends<string, number>>().toEqualTypeOf<false>()
    })
})

describe("Not", () => {
    it("negates true to false", () => {
        expectTypeOf<Not<true>>().toEqualTypeOf<false>()
    })

    it("negates false to true", () => {
        expectTypeOf<Not<false>>().toEqualTypeOf<true>()
    })
})

describe("Any", () => {
    it("returns true if any boolean in the tuple is true", () => {
        expectTypeOf<Any<[false, true, false]>>().toEqualTypeOf<true>()
        expectTypeOf<Any<[true, false]>>().toEqualTypeOf<true>()
    })

    it("returns false if all booleans are false", () => {
        expectTypeOf<Any<[false, false, false]>>().toEqualTypeOf<false>()
    })

    it("returns false for empty tuple", () => {
        expectTypeOf<Any<[]>>().toEqualTypeOf<false>()
    })
})

describe("All", () => {
    it("returns true if all booleans in the tuple are true", () => {
        expectTypeOf<All<[true, true, true]>>().toEqualTypeOf<true>()
    })

    it("returns false if any boolean is false", () => {
        expectTypeOf<All<[true, false, true]>>().toEqualTypeOf<false>()
    })

    it("returns true for empty tuple", () => {
        expectTypeOf<All<[]>>().toEqualTypeOf<true>()
    })
})

describe("StringEndsWith", () => {
    it("returns true when string ends with char", () => {
        expectTypeOf<StringEndsWith<"hello", "o">>().toEqualTypeOf<true>()
    })

    it("returns false when string does not end with char", () => {
        expectTypeOf<StringEndsWith<"hello", "x">>().toEqualTypeOf<false>()
    })

    it("returns never for empty string", () => {
        expectTypeOf<StringEndsWith<"", "a">>().toEqualTypeOf<never>()
    })
})

describe("StringContainsAdjacentMultiple", () => {
    it("returns true when string contains adjacent duplicate chars", () => {
        expectTypeOf<StringContainsAdjacentMultiple<"hello", "l">>().toEqualTypeOf<true>()
        expectTypeOf<StringContainsAdjacentMultiple<"aabb", "a">>().toEqualTypeOf<true>()
    })

    it("returns false when no adjacent duplicates exist", () => {
        expectTypeOf<StringContainsAdjacentMultiple<"helo", "l">>().toEqualTypeOf<false>()
        expectTypeOf<StringContainsAdjacentMultiple<"abab", "a">>().toEqualTypeOf<false>()
    })

    it("returns false for string without the char", () => {
        expectTypeOf<
            StringContainsAdjacentMultiple<"hello", "x">
        >().toEqualTypeOf<false>()
    })
})
