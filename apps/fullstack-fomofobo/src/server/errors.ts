import "server-only"
import { createErrorUtils } from "backend-shared/http"

export type AppErrorCode =
    | "GenericError"
    | "Unauthenticated"
    | "AccountBlocked"
    | "ForbiddenAction"
    | "ItemNotFound"
    | "RouteNotFound"
    | "InvalidRequest"
    | "ResponseValidationError"

export const { appError, toApplicationError, handleRouteNotFound } =
    createErrorUtils<AppErrorCode>({
        generic: "GenericError",
        responseValidation: "ResponseValidationError",
        routeNotFound: "RouteNotFound",
    })
