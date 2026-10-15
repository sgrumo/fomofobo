import { z } from "zod"

import { provisionObjectStore } from "../provision-object-store"

/**
 * @description Maps a comma-separated list of origins to its trimmed, non-empty entries
 * @param value Raw list
 */
const splitOrigins = (value: string): string[] =>
    value
        .split(",")
        .map(origin => origin.trim())
        .filter(origin => origin !== "")

/**
 * @remarks Defaults describe the local stack of `infra/local/docker-compose.yaml`, so
 * `pnpm infra:up:local` needs no configuration
 */
const initEnv = z.object({
    S3_ENDPOINT: z.string().nonempty().default("http://localhost:9000"),
    S3_ACCESS_KEY: z.string().nonempty().default("admin"),
    S3_SECRET_KEY: z.string().nonempty().default("admin"),
    S3_BUCKET: z.string().nonempty().default("fomofobo"),
    S3_REGION: z.string().nonempty().default("eu-west-1"),
    // Comma-separated. Every page that uploads needs its origin listed, because
    // the browser calls the store directly.
    S3_CORS_ALLOW_ORIGIN: z
        .string()
        .nonempty()
        .default("http://localhost:5173,http://localhost:3000")
        .transform(splitOrigins)
        .pipe(z.array(z.string().nonempty()).nonempty()),
    // Comma-separated, appended to the list above. A Compose fragment that needs
    // one more origin sets this key: an `include` merge keeps the first value of
    // a key two files declare, so an override of the key above never lands.
    S3_CORS_EXTRA_ORIGIN: z.string().default("").transform(splitOrigins),
})

const run = async (): Promise<void> => {
    const result = initEnv.safeParse(process.env)
    if (!result.success) {
        const problems = result.error.issues.map(issue => `  ${issue.path.join(".")}`)
        console.error(
            [
                "Cannot provision the object store. Set these variables:",
                ...problems,
                "See infra/local/README.md.",
            ].join("\n"),
        )
        process.exitCode = 1
        return
    }

    const env = result.data
    const corsAllowOrigins = [
        ...new Set([...env.S3_CORS_ALLOW_ORIGIN, ...env.S3_CORS_EXTRA_ORIGIN]),
    ]
    await provisionObjectStore({
        bucket: env.S3_BUCKET,
        region: env.S3_REGION,
        endpoint: env.S3_ENDPOINT,
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
        corsAllowOrigins,
    })
    console.info(
        `Object store ready: bucket "${env.S3_BUCKET}", CORS written for ${corsAllowOrigins.join(", ")}`,
    )
}

void run()
