import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createVenue, getVenue, updateVenue } from "../backoffice-venues/api"
import { buildVenueCreation } from "../backoffice-venues/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP update_venue", () => {
    it("changes the fields it receives, and keeps every other field and every link left out", async () => {
        const { headers } = await signInAs("admin")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        const websiteUrl = `https://www.venue-${crypto.randomUUID()}.it`
        const withLinks = await updateVenue({
            headers,
            pathParams: { id: created.data.id },
            body: {
                links: {
                    websiteUrl,
                    instagramUrl: "https://www.instagram.com/venue",
                    facebookUrl: null,
                },
            },
        })
        expectStatus(withLinks, 200)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "update_venue", {
            venueId: created.data.id,
            changes: {
                description: "Concerts in the cloister every Friday.",
                links: {
                    instagramUrl: null,
                    facebookUrl: "https://www.facebook.com/venue",
                },
            },
        })

        const read = await getVenue({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual({
            ...withLinks.data,
            description: "Concerts in the cloister every Friday.",
            links: {
                websiteUrl,
                instagramUrl: null,
                facebookUrl: "https://www.facebook.com/venue",
            },
        })
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })

    it("answers a link of the wrong site as a tool error, and leaves the venue untouched", async () => {
        const { headers } = await signInAs("admin")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "update_venue", {
            venueId: created.data.id,
            changes: { links: { instagramUrl: "https://www.facebook.com/venue" } },
        })

        expect(result).toStrictEqual({
            isError: true,
            text: "Input validation error: Invalid arguments for tool update_venue: changes.links.instagramUrl: Invalid URL",
        })
        const read = await getVenue({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(created.data)
    })
})
