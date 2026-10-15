import type { ApiError } from "models"
import { apiErrorSchema } from "models"

export class ApiTransportError extends Error {
    /** Status the API answered with, or `0` when the call never reached it. */
    public readonly status: number
    /** Body the API answered with, absent when it carried no `ApiError`. */
    public readonly apiError: ApiError | undefined

    public constructor(
        message: string,
        details: { status: number; apiError?: ApiError; cause?: unknown },
    ) {
        super(message, { cause: details.cause })
        this.name = "ApiTransportError"
        this.status = details.status
        this.apiError = details.apiError
    }
}

/**
 * @description Builds the transport error of a failed response
 * @param status Status the API answered with
 * @param body Parsed response body, of any shape
 * @remarks Keeps the body only when it matches `ApiError`, so a proxy error page
 * never reaches the caller as an API message
 */
export const buildTransportError = (status: number, body: unknown): ApiTransportError => {
    const apiError = apiErrorSchema.safeParse(body)

    return apiError.success
        ? new ApiTransportError(apiError.data.message, {
              status,
              apiError: apiError.data,
          })
        : new ApiTransportError(`The API answered with status ${String(status)}`, {
              status,
          })
}
