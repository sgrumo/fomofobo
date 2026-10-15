import { ruleTester } from "../rule-tester.mjs"
import { noIfWithExpect } from "./no-if-with-expect.mjs"

ruleTester.run("no-if-with-expect", noIfWithExpect, {
    valid: [
        "expect(value).toBe(1)",
        "if (value) { doSomething() }",
        "if (value) { doSomething() } else { doSomethingElse() }",
    ],
    invalid: [
        {
            code: "if (value) { expect(value).toBe(1) }",
            errors: [{ messageId: "noIfWithExpect" }],
        },
        {
            code: "if (value) { doSomething() } else { expect(value).toBe(1) }",
            errors: [{ messageId: "noElseWithExpect" }],
        },
        {
            code: "if (a) { doSomething() } else if (b) { expect(b).toBe(1) }",
            errors: [{ messageId: "noElseIfWithExpect" }],
        },
    ],
})
