import { ApplicationError } from "backend-shared/http"
import { HttpStatus } from "models"
import { describe, expect, it } from "vitest"

import { mapErrorStatus } from "./api"
import type { AppErrorCode } from "./errors"

const appErrorCodes: AppErrorCode[] = [
    "GenericError",
    "Unauthenticated",
    "AccountBlocked",
    "ForbiddenAction",
    "ItemNotFound",
    "EmailTaken",
    "RouteNotFound",
    "InvalidRequest",
    "ResponseValidationError",
    "OccurrenceNotFound",
    "EventNotFound",
    "VenueNotFound",
    "CategoryNotFound",
    "OrganizerNotFound",
    "CategoryInUse",
    "CategoryNameTaken",
    "InvalidPhotoUpload",
    "InvalidEventReference",
    "TooManyOccurrences",
    "PastDateRange",
    "TooManyRequests",
    "GeocodingUnavailable",
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

    it("should map a taken email to 409", () => {
        expect(statusOf("EmailTaken")).toBe(HttpStatus.Conflict)
    })

    it("should map a refused domain write to 400", () => {
        const codes: AppErrorCode[] = [
            "InvalidPhotoUpload",
            "InvalidEventReference",
            "TooManyOccurrences",
            "PastDateRange",
        ]

        expect(codes.map(statusOf)).toStrictEqual(codes.map(() => HttpStatus.BadRequest))
    })

    it("should map a missing domain entity to 404", () => {
        const codes: AppErrorCode[] = [
            "OccurrenceNotFound",
            "EventNotFound",
            "VenueNotFound",
            "CategoryNotFound",
            "OrganizerNotFound",
        ]

        expect(codes.map(statusOf)).toStrictEqual(codes.map(() => HttpStatus.NotFound))
    })

    it("should map a category conflict to 409", () => {
        expect(statusOf("CategoryInUse")).toBe(HttpStatus.Conflict)
        expect(statusOf("CategoryNameTaken")).toBe(HttpStatus.Conflict)
    })

    it("should map a client over its limit to 429 and a geocoding failure to 503", () => {
        expect(statusOf("TooManyRequests")).toBe(HttpStatus.TooManyRequests)
        expect(statusOf("GeocodingUnavailable")).toBe(HttpStatus.ServiceUnavailable)
    })

    it("should map a missing session and a blocked account to 401", () => {
        expect(statusOf("Unauthenticated")).toBe(HttpStatus.Unauthorized)
        expect(statusOf("AccountBlocked")).toBe(HttpStatus.Unauthorized)
    })

    it("should never answer a client error with a server status", () => {
        const clientErrors: AppErrorCode[] = [
            "InvalidRequest",
            "ItemNotFound",
            "ForbiddenAction",
            "Unauthenticated",
            "AccountBlocked",
            "EmailTaken",
            "OccurrenceNotFound",
            "EventNotFound",
            "VenueNotFound",
            "CategoryNotFound",
            "OrganizerNotFound",
            "CategoryInUse",
            "CategoryNameTaken",
            "InvalidPhotoUpload",
            "InvalidEventReference",
            "TooManyOccurrences",
            "PastDateRange",
            "TooManyRequests",
        ]

        expect(clientErrors.map(statusOf).every(status => status < 500)).toBe(true)
    })
})
