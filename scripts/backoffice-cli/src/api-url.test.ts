import { describe, expect, it } from "vitest"

import { apiUrlOf } from "./api-url"

describe("apiUrlOf", () => {
    it("joins the path and its query to the origin", () => {
        expect(
            apiUrlOf("https://fomofobo.example", "/api/backoffice/events?page=2").href,
        ).toBe("https://fomofobo.example/api/backoffice/events?page=2")
    })

    it("refuses a path outside the API, and a full URL to another host", () => {
        expect(() => apiUrlOf("https://fomofobo.example", "/backoffice")).toThrow(
            "/backoffice is not an API path",
        )
        expect(() =>
            apiUrlOf("https://fomofobo.example", "https://other.example/api/x"),
        ).toThrow("is not an API path")
    })
})
