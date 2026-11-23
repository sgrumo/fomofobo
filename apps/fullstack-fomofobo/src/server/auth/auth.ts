import "server-only"
import { cimd } from "@better-auth/cimd"
import { fetchClientMetadataResource } from "@better-auth/cimd/node"
import { mcp } from "@better-auth/mcp"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { jwt } from "better-auth/plugins"
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "models"
import type { DbInstanceFromSchema } from "storage"
import {
    AccountsStorage,
    accounts,
    authCredentials,
    authJwks,
    authOauthAccessTokens,
    authOauthClientAssertions,
    authOauthClientResources,
    authOauthClients,
    authOauthConsents,
    authOauthRefreshTokens,
    authOauthResources,
    authRateLimits,
    authSessions,
    authVerifications,
} from "storage"

import { routes } from "@/framework/routes/routes"

import { mcpResourceUrl } from "../mcp/mcp-resource"

export interface AuthSettings {
    baseUrl: string
    secret: string
    secureCookies: boolean
    rateLimitEnabled: boolean
    clientRegistrationEnabled: boolean
}

const OAUTH_LOGIN_PATH = routes.backofficeOauthLogin.path({ parameters: {}, query: {} })
const OAUTH_CONSENT_PATH = routes.backofficeOauthConsent.path({
    parameters: {},
    query: {},
})

const accountIdField = { userId: "accountId" }

/**
 * @description Builds the wrong-password error of the library, which a blocked account
 * answers too
 * @remarks Repeats the code and the message of the library by hand
 */
const invalidCredentialsError = (): APIError =>
    APIError.from("UNAUTHORIZED", {
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Invalid email or password",
    })

/**
 * @description Builds the auth library instance over the database
 * @param db Database of the process
 * @param settings Origin, secret and environment flags
 * @remarks Writes a refreshed session cookie through the Next cookie store, which a route
 * handler and a Server Action carry onto their response
 */
export const buildAuth = (db: DbInstanceFromSchema, settings: AuthSettings) => {
    const accountsStorage = new AccountsStorage(db)

    return betterAuth({
        appName: "fomofobo",
        baseURL: settings.baseUrl,
        secret: settings.secret,
        database: drizzleAdapter(db, {
            provider: "sqlite",
            schema: {
                accounts,
                authSessions,
                authCredentials,
                authVerifications,
                authRateLimits,
                authJwks,
                authOauthClients,
                authOauthResources,
                authOauthClientResources,
                authOauthRefreshTokens,
                authOauthAccessTokens,
                authOauthConsents,
                authOauthClientAssertions,
            },
        }),
        // The JWT plugin turns a session into a JWT there, which the MCP endpoint would take as an access token
        disabledPaths: ["/token"],
        user: {
            modelName: "accounts",
            additionalFields: {
                role: { type: "string", required: true, input: false },
                isBlocked: {
                    type: "boolean",
                    required: true,
                    defaultValue: false,
                    input: false,
                },
            },
        },
        session: { modelName: "authSessions", fields: { userId: "accountId" } },
        account: {
            modelName: "authCredentials",
            fields: { userId: "accountId", accountId: "providerAccountId" },
        },
        verification: { modelName: "authVerifications" },
        emailAndPassword: {
            enabled: true,
            disableSignUp: true,
            minPasswordLength: MIN_PASSWORD_LENGTH,
            maxPasswordLength: MAX_PASSWORD_LENGTH,
        },
        // Library default: 3 sign-ins per 10 s per IP
        rateLimit: {
            enabled: settings.rateLimitEnabled,
            storage: "database",
            modelName: "authRateLimits",
        },
        advanced: {
            useSecureCookies: settings.secureCookies,
            cookiePrefix: "fomofobo",
            database: { generateId: () => crypto.randomUUID() },
        },
        databaseHooks: {
            session: {
                create: {
                    before: async session => {
                        const account = await accountsStorage.findById(session.userId)
                        if (account === null || account.isBlocked) {
                            throw invalidCredentialsError()
                        }
                    },
                },
            },
        },
        plugins: [
            jwt({
                disableSettingJwtHeader: true,
                schema: { jwks: { modelName: "authJwks" } },
            }),
            mcp({
                resource: mcpResourceUrl(settings.baseUrl),
                loginPage: OAUTH_LOGIN_PATH,
                consentPage: OAUTH_CONSENT_PATH,
                allowDynamicClientRegistration: settings.clientRegistrationEnabled,
                allowUnauthenticatedClientRegistration:
                    settings.clientRegistrationEnabled,
                schema: {
                    oauthClient: {
                        modelName: "authOauthClients",
                        fields: accountIdField,
                    },
                    oauthResource: { modelName: "authOauthResources" },
                    oauthClientResource: { modelName: "authOauthClientResources" },
                    oauthRefreshToken: {
                        modelName: "authOauthRefreshTokens",
                        fields: accountIdField,
                    },
                    oauthAccessToken: {
                        modelName: "authOauthAccessTokens",
                        fields: accountIdField,
                    },
                    oauthConsent: {
                        modelName: "authOauthConsents",
                        fields: accountIdField,
                    },
                    oauthClientAssertion: { modelName: "authOauthClientAssertions" },
                },
            }),
            cimd({ fetchClientMetadataResource, metadataProfile: "mcp-2026-07-28" }),
            // Last plugin: it writes the cookies the other plugins set
            nextCookies(),
        ],
    })
}

export type Auth = ReturnType<typeof buildAuth>
