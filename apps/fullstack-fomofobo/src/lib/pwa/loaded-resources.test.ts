import { describe, expect, it } from "vitest"

import { loadedResourceEntries } from "./loaded-resources"

const origin = "https://fomofobo.test"

describe("loadedResourceEntries", () => {
    it("keeps the page, its chunks, its public reads and its photos", () => {
        const entries = loadedResourceEntries(new URL(`${origin}/it?lat=44&lng=11`), [
            { name: `${origin}/_next/static/chunks/a.js`, initiatorType: "script" },
            { name: `${origin}/_next/static/chunks/a.js`, initiatorType: "script" },
            {
                name: `${origin}/api/public/occurrences?lat=44&lng=11`,
                initiatorType: "fetch",
            },
            { name: `${origin}/api/public/places?q=imola`, initiatorType: "fetch" },
            { name: `${origin}/serwist/sw.js`, initiatorType: "other" },
            { name: "https://photos.fomofobo.test/events/a.jpg", initiatorType: "img" },
            { name: "https://tiles.openfreemap.org/planet", initiatorType: "fetch" },
        ])

        expect(entries).toStrictEqual([
            [`${origin}/it?lat=44&lng=11`, { headers: { accept: "text/html" } }],
            `${origin}/_next/static/chunks/a.js`,
            `${origin}/api/public/occurrences?lat=44&lng=11`,
            ["https://photos.fomofobo.test/events/a.jpg", { mode: "no-cors" }],
        ])
    })

    it("leaves a backoffice page out", () => {
        const entries = loadedResourceEntries(new URL(`${origin}/backoffice/events`), [
            { name: `${origin}/_next/static/chunks/a.js`, initiatorType: "script" },
        ])

        expect(entries).toStrictEqual([`${origin}/_next/static/chunks/a.js`])
    })
})
