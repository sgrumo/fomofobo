import { expectApiError, expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { anyIsoDateTime, anyUuid } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { buildAccountSeed, seedAccount, signIn, signInAs } from "../auth/utils"
import { createOrganizer, getOrganizer } from "./api"

describe("POST /api/backoffice/organizers", () => {
    it("creates an organizer that signs in with the password of the creation", async () => {
        const { headers } = await signInAs("admin")
        const { role: _role, ...creation } = buildAccountSeed("organizer")

        const res = await createOrganizer({ headers, body: creation })

        expectStatus(res, 201)
        expect(res.data).toStrictEqual({
            id: anyUuid,
            name: creation.name,
            email: creation.email,
            role: "organizer",
            isBlocked: false,
            createdAt: anyIsoDateTime,
        })
        const read = await getOrganizer({ headers, pathParams: { id: res.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
        expectRawStatus(await signIn(creation), 200)
    })

    it("answers 409 when another account holds the email", async () => {
        const { headers } = await signInAs("admin")
        const existing = await seedAccount(buildAccountSeed("organizer"))
        const { role: _role, ...creation } = buildAccountSeed("organizer")

        const res = await createOrganizer({
            headers,
            body: { ...creation, email: existing.email.toUpperCase() },
        })

        expectApiError(res, 409, { code: "EmailTaken" })
    })
})
