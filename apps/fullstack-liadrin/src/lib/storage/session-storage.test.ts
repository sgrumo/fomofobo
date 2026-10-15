import { kebabCase } from "es-toolkit"
import { describe, expect, it } from "vitest"

import { sessionStorageSchema } from "./session-storage"

describe("sessionStorageSchema", () => {
    it("only has kebab-case keys", () => {
        for (const key of Object.keys(sessionStorageSchema)) {
            expect(key).toBe(kebabCase(key))
        }
    })
})
