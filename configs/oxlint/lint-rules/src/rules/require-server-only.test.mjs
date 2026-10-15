import { ruleTester } from "../rule-tester.mjs"
import { requireServerOnly } from "./require-server-only.mjs"

ruleTester.run("require-server-only", requireServerOnly, {
    valid: [
        'import "server-only"',
        'import "server-only"\nexport const a = 1',
        'import { z } from "zod"\nimport "server-only"\nexport const a = z.string()',
    ],
    invalid: [
        {
            code: "export const a = 1",
            output: 'import "server-only"\nexport const a = 1',
            errors: [{ messageId: "requireServerOnly" }],
        },
        {
            code: 'import { z } from "zod"\nexport const a = z.string()',
            output: 'import "server-only"\nimport { z } from "zod"\nexport const a = z.string()',
            errors: [{ messageId: "requireServerOnly" }],
        },
        {
            code: 'import type { Marker } from "server-only"\nexport const a: Marker = 1',
            output: 'import "server-only"\nimport type { Marker } from "server-only"\nexport const a: Marker = 1',
            errors: [{ messageId: "requireServerOnly" }],
        },
    ],
})
