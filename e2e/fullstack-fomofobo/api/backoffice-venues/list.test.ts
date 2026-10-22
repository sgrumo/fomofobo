import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockVenue, createVenue, listVenues } from "./api"
import { buildVenueCreation } from "./utils"

describe("GET /api/backoffice/venues", () => {
    it("pages the venues by name", async () => {
        const { headers } = await signInAs("admin")
        const created = await Promise.all(
            ["Teatro Stignani", "Arena Imola", "Caffè Centrale"].map(async name => {
                const res = await createVenue({
                    headers,
                    body: { ...buildVenueCreation(), name },
                })
                expectStatus(res, 201)
                return res.data
            }),
        )
        const byName = created.toSorted((a, b) => a.name.localeCompare(b.name))

        const res = await listVenues({ headers, queryParams: { page: 1, pageSize: 2 } })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            items: byName.slice(0, 2),
            total: 3,
            page: 1,
            pageSize: 2,
            totalPages: 2,
        })
    })

    it("filters by text in the name or the address", async () => {
        const { headers } = await signInAs("admin")
        const byName = await createVenue({
            headers,
            body: { ...buildVenueCreation(), name: "Rocca Sforzesca" },
        })
        const byAddress = await createVenue({
            headers,
            body: {
                ...buildVenueCreation(),
                address: "Piazzale Giovanni dalle Bande Nere",
            },
        })
        expectStatus(byName, 201)
        expectStatus(byAddress, 201)
        expectStatus(await createVenue({ headers, body: buildVenueCreation() }), 201)

        const [rocca, bande] = await Promise.all([
            listVenues({ headers, queryParams: { q: "sforzesca" } }),
            listVenues({ headers, queryParams: { q: "bande nere" } }),
        ])

        expectStatus(rocca, 200)
        expectStatus(bande, 200)
        expect([rocca.data.items, bande.data.items]).toStrictEqual([
            [byName.data],
            [byAddress.data],
        ])
    })

    it("filters by blocked state", async () => {
        const { headers } = await signInAs("admin")
        const [open, closed] = await Promise.all([
            createVenue({ headers, body: buildVenueCreation() }),
            createVenue({ headers, body: buildVenueCreation() }),
        ])
        expectStatus(open, 201)
        expectStatus(closed, 201)
        const blocked = await blockVenue({
            headers,
            pathParams: { id: closed.data.id },
            body: { reason: "Closed for works" },
        })
        expectStatus(blocked, 200)

        const [active, inactive] = await Promise.all([
            listVenues({ headers, queryParams: { isBlocked: "false" } }),
            listVenues({ headers, queryParams: { isBlocked: "true" } }),
        ])

        expectStatus(active, 200)
        expectStatus(inactive, 200)
        expect([active.data.items, inactive.data.items]).toStrictEqual([
            [open.data],
            [blocked.data],
        ])
    })
})
