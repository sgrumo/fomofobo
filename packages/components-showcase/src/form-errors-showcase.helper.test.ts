import { formIssueKeys } from "frontend-shared/forms"
import type { FormIssueKey } from "frontend-shared/types"
import { describe, expect, it } from "vitest"
import type { z } from "zod"

import { formErrorsShowcaseFields } from "./form-errors-showcase.helper"

/**
 * @description Returns the issues of a parse result, empty on success
 * @template T Parsed output type
 * @param result Result read
 * @remarks Reads `error`, since Zod runs the error map on that first read, not during the parse
 */
const issuesOf = <T>(result: z.ZodSafeParseResult<T>): z.core.$ZodIssue[] =>
    result.success ? [] : result.error.issues

describe("formErrorsShowcaseFields", () => {
    it.each(Object.entries(formErrorsShowcaseFields))(
        "raises %s from its initial value",
        (key, field) => {
            const raised: FormIssueKey[][] = []
            const result = field.schema.safeParse(field.initial.value, {
                error: issue => {
                    raised.push(formIssueKeys(issue))
                    return undefined
                },
            })

            expect(issuesOf(result)).toHaveLength(1)
            expect(raised[0]?.[0]).toBe(key)
        },
    )
})
