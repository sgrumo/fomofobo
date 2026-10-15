import { kebabCaseEnumValues } from "./rules/kebab-case-enum-values.mjs"
import { noIfWithExpect } from "./rules/no-if-with-expect.mjs"
import { preferExpectStatus } from "./rules/prefer-expect-status.mjs"
import { requireServerOnly } from "./rules/require-server-only.mjs"

const plugin = {
    meta: { name: "custom" },
    rules: {
        "kebab-case-enum-values": kebabCaseEnumValues,
        "no-if-with-expect": noIfWithExpect,
        "prefer-expect-status": preferExpectStatus,
        "require-server-only": requireServerOnly,
    },
}

export default plugin
