import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { buildAccountSeed, seedAccount, signInAs } from "../auth/utils"
import { blockOrganizer, listOrganizers } from "./api"

describe("GET /api/backoffice/organizers", () => {
    it("pages the organizers by name, without the Admins", async () => {
        const { headers } = await signInAs("admin")
        const organizers = await Promise.all(
            ["Rocca Eventi", "Chiostro Live", "Bar Centrale"].map(
                async name =>
                    await seedAccount({ ...buildAccountSeed("organizer"), name }),
            ),
        )
        const byName = organizers.toSorted((a, b) => a.name.localeCompare(b.name))

        const res = await listOrganizers({
            headers,
            queryParams: { page: 1, pageSize: 2 },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            items: byName.slice(0, 2),
            total: 3,
            page: 1,
            pageSize: 2,
            totalPages: 2,
        })
    })

    it("filters by block state and by text in the name or the email", async () => {
        const { headers } = await signInAs("admin")
        const blocked = await seedAccount({
            ...buildAccountSeed("organizer"),
            name: "Rocca Eventi",
        })
        const active = await seedAccount({
            ...buildAccountSeed("organizer"),
            name: "Chiostro Live",
        })
        const block = await blockOrganizer({ headers, pathParams: { id: blocked.id } })
        expectStatus(block, 200)

        const [blockedPage, textPage] = await Promise.all([
            listOrganizers({ headers, queryParams: { isBlocked: "true" } }),
            listOrganizers({ headers, queryParams: { q: "chiostro" } }),
        ])

        expectStatus(blockedPage, 200)
        expectStatus(textPage, 200)
        expect([blockedPage.data.items, textPage.data.items]).toStrictEqual([
            [block.data],
            [active],
        ])
    })
})
