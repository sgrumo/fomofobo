import axios from "axios"
import { expectApiError, expectRawStatus } from "e2e-kit/assertions"
import {
    mintAccessToken,
    OIDC_FOREIGN_AUDIENCE_SCOPE,
    publishedOidcIssuer,
} from "e2e-kit/containers"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"

import { getE2eAccessToken } from "../api"

/**
 * @description Calls the todo list with the headers given, and nothing else
 * @param headers Headers of the call
 * @remarks Calls axios directly, because the typed caller of the suite carries the
 * token of the suite on every call, which is what these cases remove
 */
const listTodos = async (headers: Record<string, string>) =>
    await axios.get(`${publishedAppUrl()}/api/todos`, {
        headers,
        validateStatus: () => true,
    })

describe("api authentication", () => {
    it("should refuse a call that carries no token", async () => {
        const res = await listTodos({})

        expectApiError(res, 401, { code: "Unauthenticated" })
    })

    it("should refuse a token the provider did not sign", async () => {
        const res = await listTodos({ Authorization: "Bearer not-a-jwt" })

        expectApiError(res, 401, { code: "Unauthenticated" })
    })

    it("should refuse a token of another audience", async () => {
        // Signed by the same provider and still not for this API: the audience is
        // what keeps one provider from opening every service it signs for.
        const token = await mintAccessToken(
            publishedOidcIssuer(),
            OIDC_FOREIGN_AUDIENCE_SCOPE,
        )

        const res = await listTodos({ Authorization: `Bearer ${token}` })

        expectApiError(res, 401, { code: "Unauthenticated" })
    })

    it("should accept the token of the suite", async () => {
        const res = await listTodos({
            Authorization: `Bearer ${await getE2eAccessToken()}`,
        })

        expectRawStatus(res, 200)
    })

    it("should refuse a bearer header with no token after it", async () => {
        const res = await listTodos({ Authorization: "Bearer " })

        expectApiError(res, 401, { code: "Unauthenticated" })
    })

    it("should answer the health probe with no token at all", async () => {
        const res = await axios.get(`${publishedAppUrl()}/api/health`, {
            validateStatus: () => true,
        })

        expectRawStatus(res, 200)
        expect(res.data).toStrictEqual({ status: "ok" })
    })
})
