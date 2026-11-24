import { createServer } from "node:http"
import { parseArgs } from "node:util"

import {
    GEOCODING_FAILURE_TEXT,
    GEOCODING_NO_PLACE_PREFIX,
    GEOCODING_TOWN_PREFIX,
} from "./geocoding-mock-contract.ts"

const AUTOCOMPLETE_PATH = "/v1/geocode/autocomplete"
// The app searches places of Italy alone, with no radius around the center
const EXPECTED_PLACES_FILTER = "countrycode:it"
const EXPECTED_PLACES_LANGUAGE = "it"

/**
 * @description Builds the two results the mock answers for a text: one at the bias point, one north of it
 * @param text Text searched
 * @param bias Longitude and latitude of the `proximity` bias
 */
const resultsOf = (text: string, bias: { lon: number; lat: number }) => [
    {
        address_line1: text,
        city: "Imola",
        county: "Bologna",
        county_code: "BO",
        state: "Emilia-Romagna",
        lat: bias.lat,
        lon: bias.lon,
        result_type: "street",
    },
    {
        address_line1: text,
        city: "Bologna",
        county: "Bologna",
        county_code: "BO",
        state: "Emilia-Romagna",
        lat: bias.lat + 0.1,
        lon: bias.lon,
        result_type: "street",
    },
]

/**
 * @description Builds the results the mock answers to the request restricted to towns: for a text with the town prefix, a town of that name half a degree north of the bias point
 * @param text Text searched
 * @param bias Longitude and latitude of the `proximity` bias
 */
const townsOf = (text: string, bias: { lon: number; lat: number }) =>
    text.startsWith(GEOCODING_TOWN_PREFIX)
        ? [
              {
                  address_line1: text,
                  city: text,
                  county: "Bologna",
                  county_code: "BO",
                  state: "Emilia-Romagna",
                  lat: bias.lat + 0.5,
                  lon: bias.lon,
                  result_type: "city",
              },
          ]
        : []

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
    } else if (url.searchParams.get("filter") !== EXPECTED_PLACES_FILTER) {
        answer(400, { message: "Unexpected filter" })
    } else if (url.searchParams.get("lang") !== EXPECTED_PLACES_LANGUAGE) {
        answer(400, { message: "Unexpected language" })
    } else if (text === GEOCODING_FAILURE_TEXT) {
        answer(500, { message: "Internal error" })
    } else if (text.startsWith(GEOCODING_NO_PLACE_PREFIX)) {
        answer(200, { results: [] })
    } else {
        const bias = { lon: lon ?? 0, lat: lat ?? 0 }
        answer(200, {
            results:
                url.searchParams.get("type") === "city"
                    ? townsOf(text, bias)
                    : resultsOf(text, bias),
        })
    }
}).listen(Number(values.port), "127.0.0.1")
