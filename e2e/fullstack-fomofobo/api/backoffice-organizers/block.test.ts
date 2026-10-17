import { expectApiError, expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import {
    buildAccountSeed,
    seedAccount,
    signIn,
    signInAs,
    toCookieHeader,
} from "../auth/utils"
import { getMe } from "../backoffice-session/api"
import { blockOrganizer } from "./api"

describe("POST /api/backoffice/organizers/{id}/block", () => {
    it("blocks the organizer", async () => {
        const { headers } = await signInAs("admin")
        const organizer = await seedAccount(buildAccountSeed("organizer"))

        const res = await blockOrganizer({ headers, pathParams: { id: organizer.id } })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ ...organizer, isBlocked: true })
    })

    it("refuses the sign-in of a blocked organizer with the answer of a wrong password", async () => {
        const { headers } = await signInAs("admin")
        const seed = buildAccountSeed("organizer")
        const organizer = await seedAccount(seed)
        expectStatus(
            await blockOrganizer({ headers, pathParams: { id: organizer.id } }),
            200,
        )

        const blocked = await signIn(seed)
        const wrongPassword = await signIn({
            email: seed.email,
            password: `${seed.password}-wrong`,
        })

        expectRawStatus(blocked, 401)
        expect({ status: blocked.status, data: blocked.data }).toStrictEqual({
            status: wrongPassword.status,
            data: wrongPassword.data,
        })
    })

    it("ends the open session of the organizer, so its next call has no session", async () => {
        const admin = await signInAs("admin")
        const seed = buildAccountSeed("organizer")
        const organizer = await seedAccount(seed)
        const session = await signIn(seed)
        expectRawStatus(session, 200)
        const organizerHeaders = { Cookie: toCookieHeader(session.headers["set-cookie"]) }

        expectStatus(
            await blockOrganizer({
                headers: admin.headers,
                pathParams: { id: organizer.id },
            }),
            200,
        )

        expectApiError(await getMe({ headers: organizerHeaders }), 401, {
            code: "Unauthenticated",
        })
    })

    it("answers 404 for the id of an Admin", async () => {
        const { account, headers } = await signInAs("admin")

        const res = await blockOrganizer({ headers, pathParams: { id: account.id } })

        expectApiError(res, 404, { code: "OrganizerNotFound" })
    })
})
