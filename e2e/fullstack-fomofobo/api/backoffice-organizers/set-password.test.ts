import { expectApiError, expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { describe, it } from "vitest"

import {
    buildAccountSeed,
    seedAccount,
    signIn,
    signInAs,
    toCookieHeader,
} from "../auth/utils"
import { getMe } from "../backoffice-session/api"
import { setOrganizerPassword } from "./api"

describe("POST /api/backoffice/organizers/{id}/password", () => {
    it("replaces the password and ends the open sessions", async () => {
        const admin = await signInAs("admin")
        const seed = buildAccountSeed("organizer")
        const organizer = await seedAccount(seed)
        const session = await signIn(seed)
        expectRawStatus(session, 200)
        const password = `${seed.password}-new`

        const res = await setOrganizerPassword({
            headers: admin.headers,
            pathParams: { id: organizer.id },
            body: { password },
        })

        expectStatus(res, 204)
        expectApiError(
            await getMe({
                headers: { Cookie: toCookieHeader(session.headers["set-cookie"]) },
            }),
            401,
            { code: "Unauthenticated" },
        )
        expectRawStatus(await signIn(seed), 401)
        expectRawStatus(await signIn({ email: seed.email, password }), 200)
    })

    it("answers 404 for the id of an Admin", async () => {
        const { account, headers } = await signInAs("admin")

        const res = await setOrganizerPassword({
            headers,
            pathParams: { id: account.id },
            body: { password: "a-new-password-of-16" },
        })

        expectApiError(res, 404, { code: "OrganizerNotFound" })
    })
})
