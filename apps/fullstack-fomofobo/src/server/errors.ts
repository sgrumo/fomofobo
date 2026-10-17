import "server-only"
import { createErrorUtils } from "backend-shared/http"

export type AppErrorCode =
    | "GenericError"
    | "Unauthenticated"
    | "AccountBlocked"
    | "ForbiddenAction"
    | "ItemNotFound"
    | "EmailTaken"
    | "RouteNotFound"
    | "InvalidRequest"
    | "ResponseValidationError"
    | "OccurrenceNotFound"
    | "EventNotFound"
    | "VenueNotFound"
    | "CategoryNotFound"
    | "OrganizerNotFound"
    | "CategoryInUse"
    | "CategoryNameTaken"
    | "InvalidPhotoUpload"
    | "InvalidEventReference"
    | "TooManyOccurrences"
    | "PastDateRange"
    | "TooManyRequests"
    | "GeocodingUnavailable"

export const { appError, toApplicationError, handleRouteNotFound } =
    createErrorUtils<AppErrorCode>({
        generic: "GenericError",
        responseValidation: "ResponseValidationError",
        routeNotFound: "RouteNotFound",
    })
