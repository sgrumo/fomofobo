import { HttpStatus } from "models"
import type { ApiError } from "models"

const MAX_RETRIES = 3

export class ApiResponseError extends Error {
    public readonly status: number
    public readonly apiError: ApiError | undefined

    public constructor(
        message: string,
        details: { status: number; apiError: ApiError | undefined },
    ) {
        super(message)
        this.name = "ApiResponseError"
        this.status = details.status
        this.apiError = details.apiError
    }
}

/**
 * @description True when the API answered that the requested resource is unknown or hidden
 * @param error Error of a query
 */
export const isNotFoundError = (error: Error): boolean =>
    error instanceof ApiResponseError && error.status === HttpStatus.NotFound

/**
 * @description True when a failed query tries again: any error but not found, under the retry limit
 * @param failureCount Failures of the query so far
 * @param error Error of the last try
 */
export const retryUnlessNotFound = (failureCount: number, error: Error): boolean =>
    !isNotFoundError(error) && failureCount < MAX_RETRIES
