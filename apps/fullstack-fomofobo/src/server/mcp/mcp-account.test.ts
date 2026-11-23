import type { Account } from "models"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { resolveMcpAccount } from "./mcp-account"

const findById = vi.fn<(accountId: string) => Promise<Account | null>>()
const revokeSessions = vi.fn<(accountId: string) => Promise<void>>()

const admin: Account = {
    id: "9d1c2b3a-4e5f-4a6b-8c7d-0e1f2a3b4c5d",
    name: "Zonzo Admin",
    email: "admin@fomofobo.local",
    role: "admin",
    isBlocked: false,
    createdAt: "2026-11-01T09:00:00.000Z",
}

describe("resolveMcpAccount", () => {
    beforeEach(() => {
        findById.mockReset()
        revokeSessions.mockReset().mockResolvedValue(undefined)
    })

    it("should return the Admin that the token names", async () => {
        findById.mockResolvedValue(admin)

        await expect(
            resolveMcpAccount({ findById, revokeSessions }, admin.id),
        ).resolves.toStrictEqual(admin)
        expect(findById).toHaveBeenCalledWith(admin.id)
    })

    it("should refuse a token with no subject or an unknown account", async () => {
        findById.mockResolvedValue(null)

        await expect(
            resolveMcpAccount({ findById, revokeSessions }, undefined),
        ).rejects.toMatchObject({ code: "Unauthenticated" })
        await expect(
            resolveMcpAccount({ findById, revokeSessions }, admin.id),
        ).rejects.toMatchObject({ code: "Unauthenticated" })
        expect(findById).toHaveBeenCalledOnce()
    })

    it("should refuse a blocked account and end its sessions and tokens", async () => {
        findById.mockResolvedValue({ ...admin, isBlocked: true })

        await expect(
            resolveMcpAccount({ findById, revokeSessions }, admin.id),
        ).rejects.toMatchObject({ code: "AccountBlocked" })
        expect(revokeSessions).toHaveBeenCalledWith(admin.id)
    })

    it("should refuse an Organizer", async () => {
        findById.mockResolvedValue({ ...admin, role: "organizer" })

        await expect(
            resolveMcpAccount({ findById, revokeSessions }, admin.id),
        ).rejects.toMatchObject({ code: "ForbiddenAction" })
        expect(revokeSessions).not.toHaveBeenCalled()
    })
})
