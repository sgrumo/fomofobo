import { HttpStatus } from "models"
import { describe, expect, it } from "vitest"

import { ApiTransportError, buildTransportError } from "./transport-error"

describe("buildTransportError", () => {
    it("should keep the message of an ApiError body", () => {
        const error = buildTransportError(HttpStatus.NotFound, {
            code: "ItemNotFound",
            message: "Todo with id 1 not found",
            status: HttpStatus.NotFound,
        })

        expect(error.message).toBe("Todo with id 1 not found")
        expect(error.apiError?.code).toBe("ItemNotFound")
    })

    it("should keep the status of the response", () => {
        expect(buildTransportError(HttpStatus.Conflict, undefined).status).toBe(
            HttpStatus.Conflict,
        )
    })

    it("should drop a body that is not an ApiError", () => {
        const error = buildTransportError(HttpStatus.BadRequest, { detail: "nope" })

        expect(error.apiError).toBeUndefined()
        expect(error.message).toBe("The API answered with status 400")
    })

    it("should drop an absent body", () => {
        expect(
            buildTransportError(HttpStatus.InternalError, undefined).apiError,
        ).toBeUndefined()
    })

    it("should build an error the toast handler can match", () => {
        expect(buildTransportError(HttpStatus.Forbidden, undefined)).toBeInstanceOf(
            ApiTransportError,
        )
    })
})
