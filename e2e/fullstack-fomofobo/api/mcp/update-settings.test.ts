import { expectStatus } from "e2e-kit/assertions"
import { anyIsoDateTime } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getSettings, updateSettings } from "../backoffice-settings/api"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP update_settings", () => {
    it("changes the field it receives, keeps the other one, and names the Admin", async () => {
        const { headers } = await signInAs("admin")
        expectStatus(
            await updateSettings({
                headers,
                body: { endedVisibleDays: 4, participantThreshold: 15 },
            }),
            200,
        )
        const { account, tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "update_settings", {
            changes: { participantThreshold: 40 },
        })

        const read = await getSettings({ headers })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual({
            endedVisibleDays: 4,
            participantThreshold: 40,
            updatedAt: anyIsoDateTime,
            updatedBy: { id: account.id, name: account.name },
        })
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })
})
