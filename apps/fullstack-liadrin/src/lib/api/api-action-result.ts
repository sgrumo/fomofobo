import type { ApiError } from "models"

/**
 * Outcome of one API call made through a Server Action.
 *
 * A Server Action carries its answer to the browser as **data**. An error thrown on
 * the server never survives that trip: React rebuilds it as a bare `Error`, dropping
 * the class, the status and the body. A failure therefore travels as a value here, and
 * the transport raises it again on the browser side.
 */
export type ApiActionResult =
    | { outcome: "ok"; data: unknown }
    | {
          outcome: "error"
          status: number
          apiError: ApiError | undefined
          message: string
      }
