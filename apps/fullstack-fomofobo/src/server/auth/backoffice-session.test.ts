import { handleErrors } from "backend-shared/http"
import { Hono } from "hono"
import type { Account } from "models"
import { HttpStatus } from "models"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { mapErrorStatus } from "../api"
import type { BackofficeEnv } from "./backoffice-session"
import { backofficeSession, requireRole } from "./backoffice-session"

const readSession =
    vi.fn<(headers: Headers, options: { refresh: boolean }) => Promise<Account | null>>()
const revokeSessions = vi.fn<(accountId: string) => Promise<void>>()

const organizer: Account = {
    id: "4b7e9c2d-1a3f-4d6b-8e5c-7f2a9b1c3d50",
    name: "Rocca Eventi",
    email: "rocca@fomofobo.local",
    role: "organizer",
    isBlocked: false,
    createdAt: "2026-10-16T09:00:00.000Z",
}

const app = new Hono<BackofficeEnv>()
    .onError(handleErrors(mapErrorStatus, { verboseErrors: false }))
    .use("/api/backoffice/*", backofficeSession({ readSession, revokeSessions }))
    .get("/api/backoffice/me", c => c.json(c.var.account))
    .get("/api/backoffice/admin-only", requireRole("admin"), c => c.body(null, 204))

describe("backofficeSession", () => {
    beforeEach(() => {
        readSession.mockReset()
        revokeSessions.mockReset().mockResolvedValue(undefined)
    })

    it("should hand the account of the session to the route", async () => {
        readSession.mockResolvedValue(organizer)

        const res = await app.request("/api/backoffice/me", {
            headers: { Cookie: "fomofobo.session_token=token" },
        })

        expect(res.status).toBe(HttpStatus.Ok)
        expect(await res.json()).toStrictEqual(organizer)
        expect(readSession).toHaveBeenCalledWith(expect.any(Headers), { refresh: true })
        expect(readSession.mock.calls[0]?.[0].get("Cookie")).toBe(
            "fomofobo.session_token=token",
        )
    })

    it("should answer 401 Unauthenticated without a session", async () => {
        readSession.mockResolvedValue(null)

        const res = await app.request("/api/backoffice/me")

        expect(res.status).toBe(HttpStatus.Unauthorized)
        expect(await res.json()).toMatchObject({ code: "Unauthenticated" })
        expect(revokeSessions).not.toHaveBeenCalled()
    })

    it("should answer 401 AccountBlocked to a blocked account and end its sessions", async () => {
        readSession.mockResolvedValue({ ...organizer, isBlocked: true })

        const res = await app.request("/api/backoffice/me")

        expect(res.status).toBe(HttpStatus.Unauthorized)
        expect(await res.json()).toMatchObject({ code: "AccountBlocked" })
        expect(revokeSessions).toHaveBeenCalledWith(organizer.id)
    })

    it("should check the session of a backoffice path no route serves", async () => {
        readSession.mockResolvedValue(null)

        const res = await app.request("/api/backoffice/unknown")

        expect(res.status).toBe(HttpStatus.Unauthorized)
    })
})

describe("requireRole", () => {
    beforeEach(() => {
        readSession.mockReset()
    })

    it("should answer 403 ForbiddenAction to an account outside the role", async () => {
        readSession.mockResolvedValue(organizer)

        const res = await app.request("/api/backoffice/admin-only")

        expect(res.status).toBe(HttpStatus.Forbidden)
        expect(await res.json()).toMatchObject({ code: "ForbiddenAction" })
    })

    it("should let an account of the role through", async () => {
        readSession.mockResolvedValue({ ...organizer, role: "admin" })

        const res = await app.request("/api/backoffice/admin-only")

        expect(res.status).toBe(HttpStatus.NoContent)
    })
})
