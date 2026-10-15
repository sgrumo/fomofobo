import { beforeEach } from "vitest"

import { publishedAppUrl } from "./env"

beforeEach(async () => {
    const response = await fetch(`${publishedAppUrl()}/api/test/reset-database`, {
        method: "POST",
    })
    if (response.status !== 204) {
        throw new Error(`Database reset failed with status ${String(response.status)}`)
    }
})
