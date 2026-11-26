import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getSettings, updateSettings } from "../backoffice-settings/api"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP get_settings", () => {
    it("answers the settings, as the backoffice read does", async () => {
        const { headers } = await signInAs("admin")
        expectStatus(
            await updateSettings({
                headers,
                body: { endedVisibleDays: 4, participantThreshold: 15 },
            }),
            200,
        )
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "get_settings")

        const read = await getSettings({ headers })
        expectStatus(read, 200)
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })
})
