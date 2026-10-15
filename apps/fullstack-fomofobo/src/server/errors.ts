import "server-only"
import { createErrorUtils } from "backend-shared/http"

export type AppErrorCode =
    | "GenericError"
    | "Unauthenticated"
    | "AuthProviderUnavailable"
    | "ForbiddenAction"
    | "ItemNotFound"
    | "TodoAlreadyExists"
    | "RouteNotFound"
    | "InvalidRequest"
    | "ResponseValidationError"

export const { appError, toApplicationError, handleRouteNotFound } =
    createErrorUtils<AppErrorCode>({
        generic: "GenericError",
        responseValidation: "ResponseValidationError",
        routeNotFound: "RouteNotFound",
    })
