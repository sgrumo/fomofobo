import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { getMe } from "../backoffice-session/api"
import { buildAccountSeed, seedAccount, signIn, toCookieHeader } from "./utils"

describe("POST /api/auth/sign-in/email", () => {
    it("opens a session the backoffice API accepts", async () => {
        const seed = buildAccountSeed("organizer")
        const account = await seedAccount(seed)

        const res = await signIn({ email: seed.email, password: seed.password })
        expectRawStatus(res, 200)

        const me = await getMe({
            headers: { Cookie: toCookieHeader(res.headers["set-cookie"]) },
        })
        expectStatus(me, 200)
        expect(me.data).toStrictEqual(account)
    })

    it("answers a wrong password exactly as an unknown email", async () => {
        const seed = buildAccountSeed("organizer")
        await seedAccount(seed)

        const wrongPassword = await signIn({
            email: seed.email,
            password: `${seed.password}-wrong`,
        })
        const unknownEmail = await signIn({
            email: `unknown-${seed.email}`,
            password: seed.password,
        })

        expectRawStatus(wrongPassword, 401)
        expect({ status: unknownEmail.status, data: unknownEmail.data }).toStrictEqual({
            status: wrongPassword.status,
            data: wrongPassword.data,
        })
        expect(wrongPassword.headers["set-cookie"]).toBeUndefined()
    })
})
