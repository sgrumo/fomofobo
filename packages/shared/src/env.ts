import { match } from "ts-pattern"
import { z } from "zod"

/**
 * @description Returns a schema reading an absent or empty value as absent
 * @template T Schema type of the value
 * @param schema Rule applied to a value that is present
 * @remarks Docker Compose, CloudFormation and a dotenv `KEY=` line all send `""` for a
 * variable nobody set, so none can express "omitted" any other way. Use it only where
 * no value is a normal state. Every other field keeps `.nonempty()`, where `""`
 * stays a failure
 */
export const optionalEnv = <T extends z.ZodType<unknown, string>>(
    schema: T,
): z.ZodType<z.output<T> | undefined, string | undefined> =>
    z
        .string()
        .transform(value => (value === "" ? undefined : value))
        .optional()
        .pipe(schema.optional())

/**
 * @description Maps a validation issue to a short problem phrase
 * @param issue Issue reported by an environment schema
 */
export const describeEnvProblem = (issue: z.core.$ZodIssue): string =>
    match(issue)
        .with({ code: "invalid_type", expected: "string" }, () => "not set")
        .with({ code: "too_small", origin: "string" }, () => "set but empty")
        .otherwise(() => issue.message)

/**
 * @description Builds the failure message listing every invalid variable
 * @param issues Issues reported by the environment schema
 * @param header First line naming the environment that failed
 * @param footer Last line telling where the variables live
 */
export const formatEnvFailure = (
    issues: z.core.$ZodIssue[],
    header: string,
    footer: string,
): string =>
    [
        header,
        ...issues.map(issue => `  ${issue.path.join(".")}: ${describeEnvProblem(issue)}`),
        footer,
    ].join("\n")
