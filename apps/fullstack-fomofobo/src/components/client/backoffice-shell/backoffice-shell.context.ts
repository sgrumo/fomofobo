import type { Account } from "models"
import { createContext, use } from "react"

export type BackofficeAccount = Pick<Account, "id" | "name" | "role">

export const BackofficeAccountContext = createContext<BackofficeAccount | undefined>(
    undefined,
)

/**
 * @description Returns the account of the session that the backoffice shell holds
 * @throws When no shell wraps the component
 */
export const useBackofficeAccount = (): BackofficeAccount => {
    const account = use(BackofficeAccountContext)
    if (account === undefined) {
        throw new Error("useBackofficeAccount runs inside the backoffice shell alone")
    }
    return account
}
