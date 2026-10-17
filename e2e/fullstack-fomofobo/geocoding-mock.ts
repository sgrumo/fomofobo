import { createServer } from "node:http"
import { parseArgs } from "node:util"

import { GEOCODING_FAILURE_TEXT } from "./geocoding-mock-contract.ts"

const AUTOCOMPLETE_PATH = "/v1/geocode/autocomplete"

/**
 * @description Builds the two results the mock answers for a text: one at the bias point, one north of it
 * @param text Text searched
 * @param bias Longitude and latitude of the `proximity` bias
 */
const resultsOf = (text: string, bias: { lon: number; lat: number }) => [
    {
        formatted: `${text}, Imola, Italy`,
        lat: bias.lat,
        lon: bias.lon,
        result_type: "street",
    },
    {
        formatted: `${text}, Bologna, Italy`,
        lat: bias.lat + 0.1,
        lon: bias.lon,
        result_type: "city",
    },
]

const { values } = parseArgs({ options: { port: { type: "string" } } })

// Fake of the Geoapify autocomplete endpoint, started by the lifecycle of the suite
createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost")
    const text = url.searchParams.get("text") ?? ""
    const [lon, lat] = (url.searchParams.get("bias") ?? "proximity:0,0")
        .replace("proximity:", "")
        .split(",")
        .map(Number)

    const answer = (status: number, body: unknown) => {
        response.writeHead(status, { "Content-Type": "application/json" })
        response.end(JSON.stringify(body))
    }

    if (url.pathname === "/health") {
        answer(200, { status: "ok" })
    } else if (url.pathname !== AUTOCOMPLETE_PATH) {
        answer(404, { message: "Not found" })
    } else if (url.searchParams.get("apiKey") === null) {
        answer(401, { message: "Invalid apiKey" })
    } else if (text === GEOCODING_FAILURE_TEXT) {
        answer(500, { message: "Internal error" })
    } else {
        answer(200, { results: resultsOf(text, { lon: lon ?? 0, lat: lat ?? 0 }) })
    }
}).listen(Number(values.port), "127.0.0.1")
