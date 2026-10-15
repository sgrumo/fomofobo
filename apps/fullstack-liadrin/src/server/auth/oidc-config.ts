import "server-only"
import type { Configuration } from "openid-client"
// `None` names the client authentication method of a public client, which is what
// a capitalized export means here. Aliased, because it is no constructor.
import { allowInsecureRequests, discovery, None as noClientAuth } from "openid-client"
import { lazyAsync } from "shared/function"

import { resolveAppConfig } from "../config/app-config"
import { parseEnv } from "../config/env"

export interface OidcSetup {
    /** Provider metadata and client credentials, as `openid-client` holds them. */
    configuration: Configuration
    /** Origin this app answers on, the base of every redirect it builds. */
    baseUrl: string
    /** Redirect URI registered for this client at the provider. */
    redirectUri: string
    /** Scopes asked at login. */
    scope: string
    /** Audience the API accepts, sent so the provider mints a token for it. */
    audience: string
}

/**
 * @description Fetches the provider metadata and builds the client configuration
 * @throws When the environment misses a variable, or the provider is unreachable
 * @remarks Reads `OIDC_CLIENT_SECRET` to pick the client type: a secret makes the
 * client confidential, and no secret makes it public, which PKCE alone protects.
 * Several providers mint an app client without a secret, and several others refuse one
 */
const buildOidcSetup = async (): Promise<OidcSetup> => {
    const env = parseEnv(process.env)
    const { allowInsecureOidc } = resolveAppConfig(env.APP_ENV)

    const configuration = await discovery(
        new URL(env.OIDC_ISSUER),
        env.OIDC_CLIENT_ID,
        env.OIDC_CLIENT_SECRET,
        env.OIDC_CLIENT_SECRET === undefined ? noClientAuth() : undefined,
        // oxlint-disable-next-line typescript/no-deprecated -- the library marks it deprecated to make it stand out, which is the point: it is reachable from `test` and `local` alone, where the provider is a container on localhost
        allowInsecureOidc ? { execute: [allowInsecureRequests] } : undefined,
    )

    return {
        configuration,
        baseUrl: env.APP_BASE_URL,
        redirectUri: `${env.APP_BASE_URL}/auth/callback`,
        scope: env.OIDC_SCOPE,
        audience: env.OIDC_AUDIENCE,
    }
}

/**
 * @description Returns the client configuration, fetching the metadata on the first call
 * @throws When the environment misses a variable, or the provider is unreachable
 * @remarks Keeps one configuration per process, so a warm instance runs the discovery
 * call once. A failed call clears the cache, so a provider that was briefly down does
 * not break every later login
 */
export const getOidcSetup = lazyAsync(buildOidcSetup)
