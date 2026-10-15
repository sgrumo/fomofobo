import { ruleTester } from "../rule-tester.mjs"
import { kebabCaseEnumValues } from "./kebab-case-enum-values.mjs"

ruleTester.run("kebab-case-enum-values", kebabCaseEnumValues, {
    valid: [
        // Kebab-case and single-word values
        'z.enum(["in-progress", "done"])',
        'z.enum(["s", "m", "l", "xl"])',
        // External formats keep their own shape
        'z.enum(["image/png", "application/pdf"])',
        'z.enum(["v1.0"])',
        // Values resolved from a same-file array
        'const itemStatusValues = ["draft", "archived"] as const\nz.enum(itemStatusValues)',
        // pgEnum type name stays snake_case
        'pgEnum("todo_priority", ["low", "high"])',
        'const todoPriorityValues = ["low", "high"] as const\npgEnum("todo_priority", todoPriorityValues)',
        // Arrays holding non-literal elements stay unchecked
        'z.enum([...baseValues, "someValue"])',
        // Arrays that reach no enum call stay unchecked
        'const labels = ["someLabel"] as const',
        // Unresolved references stay unchecked
        "z.enum(importedValues)",
    ],
    invalid: [
        {
            code: 'z.enum(["inProgress"])',
            errors: [
                {
                    messageId: "kebabCaseEnumValue",
                    data: { value: "inProgress", suggestion: "in-progress" },
                },
            ],
        },
        {
            code: 'z.enum(["not_started", "done"])',
            errors: [
                {
                    messageId: "kebabCaseEnumValue",
                    data: { value: "not_started", suggestion: "not-started" },
                },
            ],
        },
        {
            code: 'z.enum(["Alpha Beta"])',
            errors: [
                {
                    messageId: "kebabCaseEnumValue",
                    data: { value: "Alpha Beta", suggestion: "alpha-beta" },
                },
            ],
        },
        {
            code: 'const values = ["SCREAMING_SNAKE"] as const\nz.enum(values)',
            errors: [
                {
                    messageId: "kebabCaseEnumValue",
                    data: { value: "SCREAMING_SNAKE", suggestion: "screaming-snake" },
                },
            ],
        },
        {
            code: 'pgEnum("probe_kind", ["firstKind", "second-kind"])',
            errors: [
                {
                    messageId: "kebabCaseEnumValue",
                    data: { value: "firstKind", suggestion: "first-kind" },
                },
            ],
        },
        // Reported once when both enum calls share the same array
        {
            code: 'const values = ["inProgress"] as const\nz.enum(values)\npgEnum("kind", values)',
            errors: 1,
        },
    ],
})
