import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Session } from "./session"

const getSession = vi.fn<() => Promise<Session | undefined>>()
const redirect = vi.fn<(url: string) => never>()

vi.mock(import("./session"), () => ({ getSession }))
vi.mock(import("next/navigation"), () => ({ redirect }))

const { requireSession } = await import("./require-session")

const session: Session = {
    accountId: "4b7e9c2d-1a3f-4d6b-8e5c-7f2a9b1c3d50",
    name: "Rocca Eventi",
    email: "rocca@fomofobo.local",
    role: "organizer",
}

describe("requireSession", () => {
    beforeEach(() => {
        getSession.mockReset()
        redirect.mockReset().mockImplementation(() => {
            throw new Error("NEXT_REDIRECT")
        })
    })

    it("should return the session of a signed-in visitor", async () => {
        getSession.mockResolvedValue(session)

        await expect(requireSession("/backoffice/events")).resolves.toStrictEqual(session)
        expect(redirect).not.toHaveBeenCalled()
    })

    it("should send a signed-out visitor to the login page, with the page to return to", async () => {
        getSession.mockResolvedValue(undefined)

        await expect(requireSession("/backoffice/events?page=2")).rejects.toThrow(
            "NEXT_REDIRECT",
        )
        expect(redirect).toHaveBeenCalledWith(
            "/backoffice/login?returnTo=%2Fbackoffice%2Fevents%3Fpage%3D2",
        )
    })
})
