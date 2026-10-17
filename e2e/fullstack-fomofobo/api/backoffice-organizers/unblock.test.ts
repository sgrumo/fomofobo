import { expectApiError, expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { buildAccountSeed, seedAccount, signIn, signInAs } from "../auth/utils"
import { blockOrganizer, unblockOrganizer } from "./api"

describe("POST /api/backoffice/organizers/{id}/unblock", () => {
    it("unblocks the organizer, which signs in again", async () => {
        const { headers } = await signInAs("admin")
        const seed = buildAccountSeed("organizer")
        const organizer = await seedAccount(seed)
        expectStatus(
            await blockOrganizer({ headers, pathParams: { id: organizer.id } }),
            200,
        )

        const res = await unblockOrganizer({ headers, pathParams: { id: organizer.id } })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual(organizer)
        expectRawStatus(await signIn(seed), 200)
    })

    it("answers 404 for an unknown account", async () => {
        const { headers } = await signInAs("admin")

        const res = await unblockOrganizer({
            headers,
            pathParams: { id: crypto.randomUUID() },
        })

        expectApiError(res, 404, { code: "OrganizerNotFound" })
    })
})
