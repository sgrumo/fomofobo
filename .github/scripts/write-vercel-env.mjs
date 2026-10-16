// Writes the runtime values of one environment into the Production target of its
// Vercel project: the configuration of CONFIG_FILE as plain values, and the
// credentials named in SECRET_NAMES as sensitive values. See infra/vercel/README.md.
import { readFileSync } from "node:fs"

const { CONFIG_FILE, SECRET_NAMES, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TOKEN } =
    process.env

const config = readFileSync(CONFIG_FILE, "utf8")
    .split("\n")
    .filter(line => /^[A-Z0-9_]+=/u.test(line))
    .map(line => {
        const separator = line.indexOf("=")
        return {
            key: line.slice(0, separator),
            value: line.slice(separator + 1),
            type: "plain",
            target: ["production"],
        }
    })

const secrets = SECRET_NAMES.split(" ").map(key => ({
    key,
    value: process.env[key] ?? "",
    type: "sensitive",
    target: ["production"],
}))

const url = new URL(`https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`)
url.searchParams.set("upsert", "true")
url.searchParams.set("teamId", VERCEL_ORG_ID)

const response = await fetch(url, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify([...config, ...secrets]),
})
const result = await response.json()
const failed = result.failed ?? []

// Names the keys and the error codes alone: the body can echo a value.
if (!response.ok || failed.length > 0) {
    const reasons = failed.map(({ error }) => `${error.key}: ${error.code}`)
    console.error(
        `Vercel answered ${response.status}. ${reasons.join(", ") || (result.error?.code ?? "")}`,
    )
    process.exit(1)
}

console.log(`Wrote ${config.length + secrets.length} values into the Vercel project`)
