import type { ApiError } from "models"

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
