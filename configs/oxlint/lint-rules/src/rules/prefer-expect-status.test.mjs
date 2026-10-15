import { ruleTester } from "../rule-tester.mjs"
import { preferExpectStatus } from "./prefer-expect-status.mjs"

ruleTester.run("prefer-expect-status", preferExpectStatus, {
    valid: [
        "expectStatus(response, 200)",
        "expect(response.body).toBe(200)",
        "expect(response.status).toBeGreaterThan(200)",
        "expect(response.status).toBe(expectedStatus)",
    ],
    invalid: [
        {
            code: "expect(response.status).toBe(200)",
            output: "expectStatus(response, 200)",
            errors: [{ messageId: "preferExpectStatus" }],
        },
        {
            code: "expect(response.status).toEqual(404)",
            output: "expectStatus(response, 404)",
            errors: [{ messageId: "preferExpectStatus" }],
        },
    ],
})
