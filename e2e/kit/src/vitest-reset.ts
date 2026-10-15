import { beforeEach } from "vitest"

import { truncateAllTables } from "./infra"

beforeEach(async () => {
    await truncateAllTables()
})
