import { kebabCase } from "es-toolkit"
import { describe, expect, it } from "vitest"

import { localStorageSchema } from "./local-storage"

describe("localStorageSchema", () => {
    it("only has kebab-case keys", () => {
        for (const key of Object.keys(localStorageSchema)) {
            expect(key).toBe(kebabCase(key))
        }
    })
})
