import { chmod, mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { HttpStatus } from "models"

import { apiUrlOf } from "./api-url"
import { mergeCookies } from "./cookies"
import type { Env } from "./env"

const SIGN_IN_PATH = "/api/auth/sign-in/email"

export interface ApiRequest {
    method: string
    path: string
    body?: string
}

export interface ApiResponse {
    status: number
    ok: boolean
    text: string
}

/**
 * @description Returns the file that keeps the session cookie of an app origin
 * @param baseUrl Origin of the app
 */
const sessionFileOf = (baseUrl: string): string =>
    fileURLToPath(
        new URL(
            `../node_modules/.cache/backoffice-cli/${new URL(baseUrl).host.replaceAll(/[^\w.-]/gu, "-")}.cookie`,
            import.meta.url,
        ),
    )

export class BackofficeClient {
    private readonly env: Env
    private readonly sessionFile: string
    public constructor(env: Env) {
        this.env = env
        this.sessionFile = sessionFileOf(env.APP_BASE_URL)
    }

    /**
     * @description Sends one API call with the session cookie, and signs in again once when the stored session answers `401`
     * @param request Method, path and JSON body of the call
     */
    public async request(request: ApiRequest): Promise<ApiResponse> {
        const stored = await this.readSession()
        const first = await this.send(request, stored ?? (await this.signIn()))
        if (first.status !== HttpStatus.Unauthorized || stored === null) {
            return first
        }
        return await this.send(request, await this.signIn())
    }

    /**
     * @description Signs the account in and persists its session cookie
     * @throws When the sign-in does not answer `2xx`
     */
    private async signIn(): Promise<string> {
        const response = await fetch(apiUrlOf(this.env.APP_BASE_URL, SIGN_IN_PATH), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: new URL(this.env.APP_BASE_URL).origin,
            },
            body: JSON.stringify({
                email: this.env.BACKOFFICE_EMAIL,
                password: this.env.BACKOFFICE_PASSWORD,
            }),
        })
        if (!response.ok) {
            throw new Error(
                `Sign-in as ${this.env.BACKOFFICE_EMAIL} answered ${String(response.status)}: check BACKOFFICE_EMAIL and BACKOFFICE_PASSWORD, and that the account is not blocked`,
            )
        }
        const cookie = mergeCookies("", response.headers.getSetCookie())
        await this.writeSession(cookie)
        return cookie
    }

    /**
     * @description Sends one call with the cookie, and persists the cookie that the response refreshes
     * @param request Method, path and JSON body of the call
     * @param cookie `Cookie` header of the session
     */
    private async send(request: ApiRequest, cookie: string): Promise<ApiResponse> {
        const response = await fetch(apiUrlOf(this.env.APP_BASE_URL, request.path), {
            method: request.method,
            headers: {
                Cookie: cookie,
                ...(request.body === undefined
                    ? {}
                    : { "Content-Type": "application/json" }),
            },
            body: request.body,
        })
        const setCookies = response.headers.getSetCookie()
        if (setCookies.length > 0) {
            await this.writeSession(mergeCookies(cookie, setCookies))
        }
        return { status: response.status, ok: response.ok, text: await response.text() }
    }

    /**
     * @description Fetches the stored session cookie, or `null` when none is stored
     */
    private async readSession(): Promise<string | null> {
        const cookie = await readFile(this.sessionFile, "utf8").catch(() => "")
        return cookie === "" ? null : cookie
    }

    /**
     * @description Persists the session cookie, readable by the owner of the file alone
     * @param cookie `Cookie` header of the session
     */
    private async writeSession(cookie: string): Promise<void> {
        await mkdir(path.dirname(this.sessionFile), { recursive: true })
        await writeFile(this.sessionFile, cookie, { mode: 0o600 })
        await chmod(this.sessionFile, 0o600)
    }
}
