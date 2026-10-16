import { ApplicationError } from "backend-shared/http"
import { HttpStatus } from "models"
import { describe, expect, it } from "vitest"

import { mapErrorStatus } from "./api"
import type { AppErrorCode } from "./errors"

const appErrorCodes: AppErrorCode[] = [
    "GenericError",
    "Unauthenticated",
    "ForbiddenAction",
    "ItemNotFound",
    "RouteNotFound",
    "InvalidRequest",
    "ResponseValidationError",
]

/**
 * @description Returns the status the mapper gives the code
 * @param code Error code mapped
 */
const statusOf = (code: AppErrorCode): HttpStatus =>
    mapErrorStatus(new ApplicationError(code, "failure"))

describe("mapErrorStatus", () => {
    it("should answer for every declared error code", () => {
        expect(appErrorCodes.map(statusOf)).toHaveLength(appErrorCodes.length)
    })

    it("should map a failure the application does not recognize to 500", () => {
        expect(statusOf("GenericError")).toBe(HttpStatus.InternalError)
        expect(statusOf("ResponseValidationError")).toBe(HttpStatus.InternalError)
    })

    it("should map a rejected request to 400", () => {
        expect(statusOf("InvalidRequest")).toBe(HttpStatus.BadRequest)
    })

    it("should map a missing route and a missing row to 404", () => {
        expect(statusOf("RouteNotFound")).toBe(HttpStatus.NotFound)
        expect(statusOf("ItemNotFound")).toBe(HttpStatus.NotFound)
    })

    it("should map a refused action to 403", () => {
        expect(statusOf("ForbiddenAction")).toBe(HttpStatus.Forbidden)
    })

    it("should map a missing session to 401", () => {
        expect(statusOf("Unauthenticated")).toBe(HttpStatus.Unauthorized)
    })

    it("should never answer a client error with a server status", () => {
        const clientErrors: AppErrorCode[] = [
            "InvalidRequest",
            "ItemNotFound",
            "ForbiddenAction",
            "Unauthenticated",
        ]

        expect(clientErrors.map(statusOf).every(status => status < 500)).toBe(true)
    })
})
