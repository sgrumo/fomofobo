export interface Ok<T> {
    success: true
    value: T
}
export interface Err<E> {
    success: false
    error: E
}

export type Result<T, E> = Ok<T> | Err<E>

/**
 * @description Returns an ok result holding the value
 * @template T Value type
 * @param value Value held by the result
 */
export const ok = <const T>(value: T): Ok<T> => ({
    success: true,
    value,
})
/**
 * @description Returns an err result holding the error
 * @template E Error type
 * @param error Error held by the result
 */
export const err = <const E>(error: E): Err<E> => ({
    success: false,
    error,
})

/**
 * @description Returns an operator yielding the ok value, or the fallback on failure
 * @template T Ok type
 * @template E Error type
 * @template U Fallback type
 * @param or Value returned on failure
 */
const unwrapOr =
    <T, E, U>(or: U) =>
    (result: Result<T, E>): T | U =>
        result.success ? result.value : or

/**
 * @description Returns an operator yielding the ok value, or a fallback derived from the error
 * @template T Ok type
 * @template E Error type
 * @template U Fallback type
 * @param fn Builder deriving the fallback from the error
 */
export const unwrapOrFrom =
    <T, E, U>(fn: (error: E) => U) =>
    (result: Result<T, E>): T | U =>
        result.success ? result.value : fn(result.error)

/**
 * @description Returns an operator mapping the ok value, leaving the err untouched
 * @template T Ok type
 * @template E Error type
 * @template U Mapped type
 * @param mapFn Mapper applied to the ok value
 */
export const map =
    <T, E, U>(mapFn: (value: T) => U) =>
    (result: Result<T, E>): Result<U, E> =>
        result.success ? ok(mapFn(result.value)) : result

/**
 * @description Returns the action result as ok, or the thrown value as err
 * @template T Action result type
 * @param fn Action run inside the guard
 */
const trySync = <const T>(fn: () => T): Result<T, unknown> => {
    try {
        return ok(fn())
    } catch (error) {
        return err(error)
    }
}

/**
 * @description Returns the resolved value as ok, or the thrown value as err
 * @template T Resolved value type
 * @param fn Async action run inside the guard
 */
const tryAsync = async <const T>(fn: () => Promise<T>): Promise<Result<T, unknown>> => {
    try {
        return ok(await fn())
    } catch (error) {
        return err(error)
    }
}

/**
 * @description Returns a wrapper yielding a result instead of throwing
 * @template A Argument tuple type
 * @template T Return type
 * @param fn Function wrapped by the guard
 */
const safeguard =
    <const A extends unknown[], const T>(fn: (...args: A) => T) =>
    (...args: A): Result<T, unknown> =>
        trySync(() => fn(...args))

export const Result = {
    ok,
    err,
    unwrapOr,
    unwrapOrFrom,
    map,
    try: trySync,
    tryAsync,
    safeguard,
}
