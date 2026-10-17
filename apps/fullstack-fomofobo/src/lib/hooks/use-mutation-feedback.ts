import { useTranslation } from "react-i18next"
import type { NewToast } from "ui-components/toast"
import { useToast } from "ui-components/toast"

import { ApiTransportError } from "@/lib/api/transport-error"
import type { AppErrorCode } from "@/server/errors"

const EXPLAINED_ERROR_CODES = [
    "ForbiddenAction",
    "EmailTaken",
    "EventNotFound",
    "VenueNotFound",
    "CategoryNotFound",
    "OrganizerNotFound",
    "CategoryInUse",
    "CategoryNameTaken",
    "InvalidPhotoUpload",
    "InvalidEventReference",
    "TooManyOccurrences",
] as const satisfies readonly AppErrorCode[]

type ExplainedErrorCode = (typeof EXPLAINED_ERROR_CODES)[number]

/**
 * @description True when the code is one the backoffice explains in its own words
 * @param code Error code the API answered
 */
const isExplained = (code: string): code is ExplainedErrorCode =>
    EXPLAINED_ERROR_CODES.some(explained => explained === code)

/**
 * @description Returns the toasts that report the result of a backoffice write
 */
export const useMutationFeedback = () => {
    const { t } = useTranslation("shared")
    const toast = useToast()

    const failureToast = (error: Error): NewToast => {
        if (!(error instanceof ApiTransportError)) {
            return { type: "error", error: { type: "generic" } }
        }
        const code = error.apiError?.code
        return code !== undefined && isExplained(code)
            ? {
                  type: "error",
                  error: {
                      type: "api",
                      unknown: false,
                      status: error.status,
                      messages: [t(`Backoffice.Errors.${code}`)],
                  },
              }
            : { type: "error", error: { type: "api", unknown: true } }
    }

    return {
        succeeded: (message: string) => {
            toast.add({ type: "success", messages: [message] })
        },
        failed: (error: Error) => {
            toast.add(failureToast(error))
        },
    }
}
