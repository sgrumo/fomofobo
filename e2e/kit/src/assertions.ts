/**
 * @description Asserts the value is neither `null` nor `undefined`, narrowing it
 * @template T Value type
 * @param obj Value asserted
 * @throws When the value is `null` or `undefined`
 * @remarks Uses a `function` declaration for the `asserts` signature
 */
export function expectToBeDefined<T>(obj: T): asserts obj is NonNullable<T> {
    if (obj === null || obj === undefined) {
        const error = new Error(
            `Expected value to be defined, but got ${obj === null ? "null" : "undefined"}`,
        )
        Error.captureStackTrace(error, expectToBeDefined)
        throw error
    }
}

/**
 * @description Asserts an exact HTTP status on a raw `fetch` response
 * @param response Object carrying a numeric `status`
 * @param expectedStatus Status the response must carry
 * @throws When the status differs
 * @remarks Typed `createApiCall` responses take `expectStatus` instead
 */
export function expectRawStatus(response: { status: number }, expectedStatus: number) {
    if (response.status !== expectedStatus) {
        const error = new Error(
            `Expected raw status ${String(expectedStatus)}, but got ${String(response.status)}`,
        )
        Error.captureStackTrace(error, expectRawStatus)
        throw error
    }
}

/**
 * @description Asserts an exact HTTP status on a typed API response, narrowing it
 * @template T Response type
 * @template S Expected status type
 * @param response Typed API response
 * @param expectedStatus Status the response must carry
 * @throws When the status differs
 * @remarks Uses a `function` declaration for the `asserts` signature
 */
export function expectStatus<T extends { status: number }, S extends T["status"]>(
    response: T,
    expectedStatus: S,
): asserts response is T & { status: S } {
    if (response.status !== expectedStatus) {
        const responseData = "data" in response ? response.data : undefined
        const errorMessage =
            `Expected status ${String(expectedStatus)}, but got ${String(response.status)}\n\n` +
            `Response data:\n${JSON.stringify(responseData, null, 2)}`

        const error = new Error(errorMessage)
        Error.captureStackTrace(error, expectStatus)
        throw error
    }
}

/**
 * @description Asserts an exact HTTP status and the error body of the API, narrowing it
 * @template T Response type
 * @template S Expected status type
 * @param response Typed or raw API response
 * @param expectedStatus Status the response must carry
 * @param expected Error code the body must carry, and its message when given
 * @throws When the status, the code or the given message differs
 * @remarks Uses a `function` declaration for the `asserts` signature
 */
export function expectApiError<
    T extends { status: number; data: unknown },
    S extends T["status"],
>(
    response: T,
    expectedStatus: S,
    expected: { code: string; message?: string },
): asserts response is T & { status: S } {
    const body =
        typeof response.data === "object" && response.data !== null ? response.data : {}
    const code = "code" in body ? body.code : undefined
    const message = "message" in body ? body.message : undefined
    const matches =
        response.status === expectedStatus &&
        code === expected.code &&
        (expected.message === undefined || message === expected.message)

    if (!matches) {
        const error = new Error(
            `Expected status ${String(expectedStatus)} with ${JSON.stringify(expected)}, ` +
                `but got status ${String(response.status)}\n\n` +
                `Response data:\n${JSON.stringify(response.data, null, 2)}`,
        )
        Error.captureStackTrace(error, expectApiError)
        throw error
    }
}
