import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { buildAccountSeed, seedAccount, signInAs } from "../auth/utils"
import { getOrganizer } from "./api"

describe("GET /api/backoffice/organizers/{id}", () => {
    it("answers the organizer", async () => {
        const { headers } = await signInAs("admin")
        const organizer = await seedAccount(buildAccountSeed("organizer"))

        const res = await getOrganizer({ headers, pathParams: { id: organizer.id } })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual(organizer)
    })

    it("answers 404 for the id of an Admin", async () => {
        const { account, headers } = await signInAs("admin")

        const res = await getOrganizer({ headers, pathParams: { id: account.id } })

        expectApiError(res, 404, { code: "OrganizerNotFound" })
    })

    it("answers 404 for an unknown account", async () => {
        const { headers } = await signInAs("admin")

        const res = await getOrganizer({
            headers,
            pathParams: { id: crypto.randomUUID() },
        })

        expectApiError(res, 404, { code: "OrganizerNotFound" })
    })

    it("answers 403 ForbiddenAction to an Organizer", async () => {
        const { account, headers } = await signInAs("organizer")

        const res = await getOrganizer({ headers, pathParams: { id: account.id } })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
