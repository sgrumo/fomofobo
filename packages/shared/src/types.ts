//#region values
export type Primitive = string | number | boolean | null | undefined | symbol | bigint
export type Timeout = ReturnType<typeof setTimeout>
export type Interval = ReturnType<typeof setInterval>
export type Serializable =
    | string
    | number
    | boolean
    | null
    | Date
    | { [K in string | number]: Serializable }
    | Serializable[]
/**
 * @description Returns the picked member of a union
 * @template T Union picked from
 * @template U Picked member
 */
export type Select<T, U extends T> = U
/**
 * @description Returns the literal members of a union a library opens with `(string & {})`
 * @template T Union read
 * @remarks Yields `never` for a union that holds no string literal
 */
export type Literals<T> = T extends string ? (string extends T ? never : T) : never
//#endregion

//#region objects
// SAFETY: used only in `extends` clauses, never in a type output.
// `unknown` as the value type does not match interfaces, because of
// index signature rules.
//
// oxlint-disable-next-line typescript/no-explicit-any
type AnyObject = Record<string, any>
export type EmptyObject = Record<PropertyKey, never>
/**
 * @description Returns the intersection as one flat object type, keeping every modifier
 * @template T Intersection flattened
 */
export type Simplify<T> = { [K in keyof T]: T[K] }
type Leaf = Primitive | Date | ((...args: never[]) => unknown)
/**
 * @description Returns the dotted path of every nested property, with `[N]` for an array item
 * @template T Type walked
 * @template D Counter of the levels walked so far
 * @remarks Stops after eight levels, so a recursive type yields a finite union
 */
export type Paths<T, D extends unknown[] = []> = D["length"] extends 8
    ? never
    : T extends Leaf
      ? never
      : T extends ReadonlyArray<infer U>
        ? "[N]" | `[N].${Paths<U, [...D, unknown]>}`
        : T extends AnyObject
          ? {
                [K in keyof T & string]: K | `${K}.${Paths<T[K], [...D, unknown]>}`
            }[keyof T & string]
          : never
/**
 * @description Returns the paths nested under one segment, with the segment prefix removed
 * @template P Paths filtered
 * @template K Segment matched at the head of each path
 */
export type SubPaths<P extends string, K extends string> = P extends `${K}.${infer Rest}`
    ? Rest
    : never

type TransformMode = "deep" | "shallow"
/**
 * @description Returns the recursion mode named by the options, `deep` when absent
 * @template O Options read
 */
type ModeOf<O> = O extends { mode: "shallow" } ? "shallow" : "deep"
/**
 * @description Returns the paths the options leave untouched, `never` when absent
 * @template O Options read
 */
type ExcludeOf<O> = O extends { exclude: infer E extends string } ? E : never

/**
 * @description Returns one array item with its optional properties required, unless `[N]` is excluded
 * @template U Item type
 * @template M Recursion mode
 * @template E Paths relative to the array
 */
type SpecifiedItem<U, M extends TransformMode, E extends string> = ["[N]"] extends [E]
    ? U
    : SpecifiedImpl<U, M, SubPaths<E, "[N]">>
/**
 * @description Returns one property value with its optional properties required, unless the mode is shallow
 * @template V Property value
 * @template K Property key
 * @template M Recursion mode
 * @template E Paths relative to the parent object
 */
type SpecifiedChild<
    V,
    K extends string,
    M extends TransformMode,
    E extends string,
> = M extends "shallow" ? V : SpecifiedImpl<V, M, SubPaths<E, K>>
/**
 * @description Returns the object with every non-excluded key required
 * @template T Object transformed
 * @template M Recursion mode
 * @template E Paths relative to the object
 */
type SpecifiedKeys<T extends AnyObject, M extends TransformMode, E extends string> = {
    [K in keyof Required<T> as [K] extends [E] ? never : K]: SpecifiedChild<
        T[K],
        K & string,
        M,
        E
    >
}
/**
 * @description Returns the object with the excluded keys kept as declared next to the required keys
 * @template T Object transformed
 * @template M Recursion mode
 * @template E Paths relative to the object
 * @remarks Skips the split when no path is excluded, so the common case stays one mapped type
 */
type SpecifiedObject<T extends AnyObject, M extends TransformMode, E extends string> = [
    E,
] extends [never]
    ? SpecifiedKeys<T, M, E>
    : Simplify<
          { [K in keyof T as [K] extends [E] ? K : never]: T[K] } & SpecifiedKeys<T, M, E>
      >
/**
 * @description Returns the type with every optional property required
 * @template T Type transformed
 * @template M Recursion mode
 * @template E Paths left untouched
 * @remarks Walks into arrays in both modes, so `shallow` stops at the first object level only
 */
type SpecifiedImpl<T, M extends TransformMode, E extends string> = T extends Leaf
    ? T
    : T extends Array<infer U>
      ? Array<SpecifiedItem<U, M, E>>
      : T extends ReadonlyArray<infer U>
        ? ReadonlyArray<SpecifiedItem<U, M, E>>
        : T extends AnyObject
          ? SpecifiedObject<T, M, E>
          : T
/**
 * @description Returns the type with every optional property required
 * @template T Type expanded
 * @template O Recursion mode, `deep` by default, and paths left untouched
 * @remarks Keeps an excluded path as declared, without recursion into it
 */
export type Specified<
    T,
    O extends { mode?: TransformMode; exclude?: Paths<T> } = { mode: "deep" },
> = SpecifiedImpl<T, ModeOf<O>, ExcludeOf<O>>
/**
 * @description Returns one array item with every property optional, unless `[N]` is excluded
 * @template U Item type
 * @template M Recursion mode
 * @template E Paths relative to the array
 */
type PartialItem<U, M extends TransformMode, E extends string> = ["[N]"] extends [E]
    ? U
    : PartialImpl<U, M, SubPaths<E, "[N]">>
/**
 * @description Returns one property value with every property optional, unless the mode is shallow
 * @template V Property value
 * @template K Property key
 * @template M Recursion mode
 * @template E Paths relative to the parent object
 */
type PartialChild<
    V,
    K extends string,
    M extends TransformMode,
    E extends string,
> = M extends "shallow" ? V : PartialImpl<V, M, SubPaths<E, K>>
/**
 * @description Returns the object with every non-excluded key optional
 * @template T Object transformed
 * @template M Recursion mode
 * @template E Paths relative to the object
 */
type PartialKeys<T extends AnyObject, M extends TransformMode, E extends string> = {
    [K in keyof T as [K] extends [E] ? never : K]?: PartialChild<T[K], K & string, M, E>
}
/**
 * @description Returns the object with the excluded keys kept as declared next to the optional keys
 * @template T Object transformed
 * @template M Recursion mode
 * @template E Paths relative to the object
 * @remarks Skips the split when no path is excluded, so the common case stays one mapped type
 */
type PartialObject<T extends AnyObject, M extends TransformMode, E extends string> = [
    E,
] extends [never]
    ? PartialKeys<T, M, E>
    : Simplify<
          { [K in keyof T as [K] extends [E] ? K : never]: T[K] } & PartialKeys<T, M, E>
      >
/**
 * @description Returns the type with every property optional
 * @template T Type transformed
 * @template M Recursion mode
 * @template E Paths left untouched
 * @remarks Walks into arrays in both modes, so `shallow` stops at the first object level only
 */
type PartialImpl<T, M extends TransformMode, E extends string> = T extends Leaf
    ? T
    : T extends Array<infer U>
      ? Array<PartialItem<U, M, E>>
      : T extends ReadonlyArray<infer U>
        ? ReadonlyArray<PartialItem<U, M, E>>
        : T extends AnyObject
          ? PartialObject<T, M, E>
          : T
/**
 * @description Returns the type with every property optional
 * @template T Type relaxed
 * @template O Recursion mode, `deep` by default, and paths left untouched
 * @remarks Shadows the built-in `Partial` in every module that imports it
 */
export type Partial<
    T,
    O extends { mode?: TransformMode; exclude?: Paths<T> } = { mode: "deep" },
> = PartialImpl<T, ModeOf<O>, ExcludeOf<O>>

/**
 * @description Returns the type without the given keys
 * @template T Source type
 * @template K Keys removed
 */
export type StrictOmit<T, K extends keyof T> = Omit<T, K>
/**
 * @description Returns the union without the given members
 * @template T Source union
 * @template U Members removed
 */
export type StrictExclude<T, U extends T> = Exclude<T, U>
/**
 * @description Returns the type with the given keys required
 * @template T Source type
 * @template K Keys made required
 */
export type Require<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: T[P] }
//#endregion

//#region lists
/**
 * @description Returns the item type of a list
 * @template T Source list
 */
export type ListItems<T extends unknown[]> = T extends Array<infer U> ? U : never
/**
 * @description Returns the type of the first list item
 * @template T Source list
 */
export type ListHead<T extends unknown[]> = T extends [infer U, ...unknown[]] ? U : never
/**
 * @description Returns the list type without the first item
 * @template T Source list
 */
export type ListTail<T extends unknown[]> = T extends [unknown, ...infer U] ? U : never
//#endregion

//#region booleans
/**
 * @description True when the candidate is assignable to the target
 * @template T Candidate type
 * @template U Target type
 */
export type Extends<T, U> = T extends U ? true : false
/**
 * @description Returns the opposite of a boolean type
 * @template T Boolean inverted
 */
export type Not<T extends boolean> = T extends true ? false : true
/**
 * @description True when at least one member of the list is `true`
 * @template T List of booleans
 */
export type Any<T extends boolean[]> = T extends [infer U, ...infer R]
    ? U extends true
        ? true
        : R extends boolean[]
          ? Any<R>
          : false
    : false
/**
 * @description True when every member of the list is `true`
 * @template T List of booleans
 */
export type All<T extends boolean[]> = T extends [infer U, ...infer R]
    ? U extends true
        ? R extends boolean[]
            ? All<R>
            : false
        : false
    : true
//#endregion

//#region strings
/**
 * @description True when the string ends with the given character
 * @template T String read
 * @template U Expected last character
 * @remarks Yields `never` for an empty string
 */
export type StringEndsWith<
    T extends string,
    U extends string,
> = T extends `${infer F}${infer R}`
    ? R extends ""
        ? F extends U
            ? true
            : false
        : StringEndsWith<R, U>
    : never
/**
 * @description True when the remaining string holds two adjacent instances of the character
 * @template T Remaining string
 * @template U Character looked for
 * @template V Flag marking the previous character as a match
 */
type StringContainsAdjacentMultipleImpl<
    T extends string,
    U extends string,
    V extends boolean,
> = T extends `${infer F}${infer R}`
    ? F extends U
        ? V extends true
            ? true
            : StringContainsAdjacentMultipleImpl<R, U, true>
        : StringContainsAdjacentMultipleImpl<R, U, false>
    : false
/**
 * @description True when the string holds two adjacent instances of the character
 * @template T String read
 * @template U Character looked for
 */
export type StringContainsAdjacentMultiple<
    T extends string,
    U extends string,
> = StringContainsAdjacentMultipleImpl<T, U, false>
//#endregion
