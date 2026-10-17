import type { Account } from "models"
import { beforeEach, describe, expect, it, vi } from "vitest"

const getSession = vi.fn<() => Promise<Account | undefined>>()
const redirect = vi.fn<(url: string) => never>()
const notFound = vi.fn<() => never>()

vi.mock(import("./session"), () => ({ getSession }))
vi.mock(import("next/navigation"), () => ({ redirect, notFound }))

const { requireAdminSession, requireSession } = await import("./require-session")

const account: Account = {
    id: "4b7e9c2d-1a3f-4d6b-8e5c-7f2a9b1c3d50",
    name: "Rocca Eventi",
    email: "rocca@fomofobo.local",
    role: "organizer",
    isBlocked: false,
    createdAt: "2026-10-16T09:00:00.000Z",
}

describe("requireSession", () => {
    beforeEach(() => {
        getSession.mockReset()
        redirect.mockReset().mockImplementation(() => {
            throw new Error("NEXT_REDIRECT")
        })
    })

    it("should return the account of a signed-in visitor", async () => {
        getSession.mockResolvedValue(account)

        await expect(requireSession("/backoffice/events")).resolves.toStrictEqual(account)
        expect(redirect).not.toHaveBeenCalled()
    })

    it("should send a signed-out visitor to the login page, with the page to return to", async () => {
        getSession.mockResolvedValue(undefined)

        await expect(requireSession("/backoffice/events?page=2")).rejects.toThrow(
            "NEXT_REDIRECT",
        )
        expect(redirect).toHaveBeenCalledWith(
            "/backoffice/login?return-to=%2Fbackoffice%2Fevents%3Fpage%3D2",
        )
    })
})

describe("requireAdminSession", () => {
    beforeEach(() => {
        getSession.mockReset()
        notFound.mockReset().mockImplementation(() => {
            throw new Error("NEXT_NOT_FOUND")
        })
    })

    it("should return the account of a signed-in Admin", async () => {
        const admin: Account = { ...account, role: "admin" }
        getSession.mockResolvedValue(admin)

        await expect(
            requireAdminSession("/backoffice/organizers"),
        ).resolves.toStrictEqual(admin)
        expect(notFound).not.toHaveBeenCalled()
    })

    it("should answer not found to an Organizer", async () => {
        getSession.mockResolvedValue(account)

        await expect(requireAdminSession("/backoffice/organizers")).rejects.toThrow(
            "NEXT_NOT_FOUND",
        )
    })
})
