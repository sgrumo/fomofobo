import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Session } from "./session"

const getSession = vi.fn<() => Promise<Session | undefined>>()
const redirect = vi.fn<(url: string) => never>()

vi.mock(import("./session"), () => ({ getSession }))
vi.mock(import("next/navigation"), () => ({ redirect }))

const { requireSession } = await import("./require-session")

const session: Session = {
    accessToken: "token",
    subject: "user-1",
    name: "User One",
    email: undefined,
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

        await expect(requireSession("/todos")).resolves.toStrictEqual(session)
        expect(redirect).not.toHaveBeenCalled()
    })

    it("should send a signed-out visitor to the login, with the page to return to", async () => {
        getSession.mockResolvedValue(undefined)

        await expect(requireSession("/todos/search?text=milk")).rejects.toThrow(
            "NEXT_REDIRECT",
        )
        expect(redirect).toHaveBeenCalledWith(
            "/auth/login?returnTo=%2Ftodos%2Fsearch%3Ftext%3Dmilk",
        )
    })
})
