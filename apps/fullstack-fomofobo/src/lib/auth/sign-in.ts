import type { AccountCredentials } from "models"
import { HttpStatus } from "models"
import { Result } from "shared/result"

export const SIGN_IN_PATH = "/api/auth/sign-in/email"

export type SignInOutcome = "signed-in" | "invalid-credentials" | "failed"

/**
 * @description Sends the email and password to the sign-in endpoint and returns the outcome
 * @param credentials Email and password typed in the login form
 * @remarks Answers `invalid-credentials` for a blocked account too: the endpoint answers
 * a blocked account like a wrong password
 */
export const signInWithEmail = async (
    credentials: AccountCredentials,
): Promise<SignInOutcome> => {
    const response = await Result.tryAsync(() =>
        fetch(SIGN_IN_PATH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        }),
    )
    if (!response.success) {
        return "failed"
    }
    if (response.value.ok) {
        return "signed-in"
    }

    return response.value.status === HttpStatus.Unauthorized
        ? "invalid-credentials"
        : "failed"
}
