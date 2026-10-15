import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import type { StartedTestContainer } from "testcontainers"
import { GenericContainer, Wait } from "testcontainers"
import { z } from "zod"

import { DATABASE_URL_ENV } from "./env"

export type { StartedPostgreSqlContainer, StartedTestContainer }

/**
 * @description Starts a PostgreSQL testcontainer and waits for readiness
 * @param log Sink for progress messages
 */
export const startPostgresContainer = async (
    log: (msg: string) => void,
): Promise<StartedPostgreSqlContainer> => {
    log("starting PostgreSQL container...")
    const container = await new PostgreSqlContainer("postgres:18.6-trixie")
        .withDatabase("postgres")
        .withUsername("postgres")
        .withPassword("postgres")
        // Durability buys nothing on a database that lives for one run
        .withCommand([
            "postgres",
            "-c",
            "fsync=off",
            "-c",
            "synchronous_commit=off",
            "-c",
            "full_page_writes=off",
        ])
        .withStartupTimeout(60_000)
        .start()
    log(`PostgreSQL ready on port ${String(container.getMappedPort(5432))}`)
    return container
}

/**
 * @description Sets the database connection env vars from the started container
 * @param pg Started PostgreSQL container
 * @remarks Mutates `process.env`
 */
export const setContainerEnv = (pg: StartedPostgreSqlContainer) => {
    process.env.PGHOST = pg.getHost()
    process.env.PGPORT = String(pg.getMappedPort(5432))
    process.env.PGUSER = "postgres"
    process.env.PGPASSWORD = "postgres"
    process.env.PGDATABASE = "postgres"
    process.env[DATABASE_URL_ENV] = pg.getConnectionUri()
    process.env.DISABLE_DRIZZLE_LOGS = "true"
}

const OBJECT_STORE_ACCESS_KEY = "yggtestaccess"
const OBJECT_STORE_SECRET_KEY = "yggtestsecret123"
const OBJECT_STORE_REGION = "us-east-1"
export const OBJECT_STORE_PORT = 9000

export const E2E_BUCKET = "fomofobo-test"

/**
 * @description Starts a RustFS testcontainer and waits for readiness
 * @param log Sink for progress messages
 */
export const startObjectStoreContainer = async (
    log: (msg: string) => void,
): Promise<StartedTestContainer> => {
    log("starting RustFS container...")
    const container = await new GenericContainer("rustfs/rustfs:1.0.0-rc.5")
        .withEnvironment({
            RUSTFS_ACCESS_KEY: OBJECT_STORE_ACCESS_KEY,
            RUSTFS_SECRET_KEY: OBJECT_STORE_SECRET_KEY,
            RUSTFS_CONSOLE_ENABLE: "false",
        })
        .withExposedPorts(OBJECT_STORE_PORT)
        .withWaitStrategy(Wait.forHttp("/health", OBJECT_STORE_PORT).forStatusCode(200))
        .withStartupTimeout(60_000)
        .start()
    log(`RustFS ready on port ${String(container.getMappedPort(OBJECT_STORE_PORT))}`)
    return container
}

/**
 * @description Builds the S3 env vars pointing at the object store endpoint
 * @param endpoint Object store base URL
 */
export const objectStoreEnv = (endpoint: string) => ({
    S3_ENDPOINT: endpoint,
    S3_ACCESS_KEY: OBJECT_STORE_ACCESS_KEY,
    S3_SECRET_KEY: OBJECT_STORE_SECRET_KEY,
    S3_BUCKET: E2E_BUCKET,
    S3_REGION: OBJECT_STORE_REGION,
})

const OIDC_CONTAINER_PORT = 8080
/** Issuer path of the provider. Its first path segment names the issuer. */
const OIDC_ISSUER_ID = "default"
export const OIDC_CLIENT_ID = "fomofobo"
/**
 * Audience the API accepts.
 *
 * It equals the client id on purpose. The claims below land on every token the mock
 * mints, the id token included, and an id token must name the client in its `aud` or
 * `openid-client` refuses it. One value satisfies both checks. A real provider sets
 * the two apart on its own, and the app reads them from two variables.
 */
export const OIDC_AUDIENCE = OIDC_CLIENT_ID
/** `sub` of the visitor every suite signs in as. */
export const OIDC_SUBJECT = "e2e-user"
export const OIDC_USER_NAME = "E2E User"

/** Scope that asks the provider for a token of another API. */
export const OIDC_FOREIGN_AUDIENCE_SCOPE = "foreign-audience"

/**
 * Configuration of the mock provider.
 *
 * `interactiveLogin: false` drops the login page: `/authorize` answers the redirect
 * with a code at once, so a Playwright test needs no credentials and no form.
 *
 * The claims are fixed here rather than read from the request, because the browser
 * flow sends its `audience` to `/authorize` and the provider reads that parameter at
 * `/token` alone. Fixed claims give both grants the same audience. The first mapping
 * is the one exception, so a test can still ask for a token of another API.
 */
const oidcJsonConfig = JSON.stringify({
    interactiveLogin: false,
    tokenCallbacks: [
        {
            issuerId: OIDC_ISSUER_ID,
            tokenExpiry: 3600,
            requestMappings: [
                {
                    requestParam: "scope",
                    match: OIDC_FOREIGN_AUDIENCE_SCOPE,
                    claims: { sub: OIDC_SUBJECT, aud: ["another-api"] },
                },
                {
                    requestParam: "grant_type",
                    match: "*",
                    claims: {
                        sub: OIDC_SUBJECT,
                        aud: [OIDC_AUDIENCE],
                        name: OIDC_USER_NAME,
                        email: "e2e@example.com",
                    },
                },
            ],
        },
    ],
})

/**
 * @description Starts the OpenID provider of the suites on a mapped port
 * @param log Sink for progress messages
 * @remarks Derives its issuer from the `Host` header of the request. The app and the
 * browser must therefore reach it through the same host, or the `iss` claim of a token
 * does not match the issuer the API verifies against
 */
export const startOidcProviderContainer = async (
    log: (msg: string) => void,
): Promise<StartedTestContainer> => {
    log("starting the OpenID provider container...")
    const container = await new GenericContainer(
        "ghcr.io/navikt/mock-oauth2-server:6.0.2@sha256:b538810afd589d42fbfb856c588c2065eaeed1dc528d6c532972048e67fc2aff",
    )
        .withEnvironment({ JSON_CONFIG: oidcJsonConfig })
        .withExposedPorts(OIDC_CONTAINER_PORT)
        .withWaitStrategy(
            Wait.forHttp("/isalive", OIDC_CONTAINER_PORT).forStatusCode(200),
        )
        .withStartupTimeout(60_000)
        .start()
    log(
        `OpenID provider ready on port ${String(container.getMappedPort(OIDC_CONTAINER_PORT))}`,
    )
    return container
}

/**
 * @description Returns the issuer of a started provider
 * @param container Provider container, started
 * @remarks Reads the host from the container, never a literal. In CI the suite runs
 * inside a job container and the provider binds on the Docker host, so `127.0.0.1`
 * names the wrong machine there; `getHost()` names the right one everywhere
 */
export const oidcIssuer = (container: StartedTestContainer): string =>
    `http://${container.getHost()}:${String(container.getMappedPort(OIDC_CONTAINER_PORT))}/${OIDC_ISSUER_ID}`

/** Variable the lifecycle hands the issuer to the test workers through. */
export const OIDC_ISSUER_ENV = "OIDC_ISSUER"

/**
 * @description Returns the issuer the lifecycle published for this run
 * @throws When no lifecycle published one, which means no provider runs
 */
export const publishedOidcIssuer = (): string => {
    const issuer = process.env[OIDC_ISSUER_ENV]
    if (issuer === undefined || issuer === "") {
        throw new Error(
            `No ${OIDC_ISSUER_ENV} in the environment: the lifecycle started no provider`,
        )
    }
    return issuer
}

/**
 * @description Builds the OIDC env vars of an app under test
 * @param issuer Issuer of the started provider
 * @param appBaseUrl Origin the app answers on
 */
export const oidcEnv = (issuer: string, appBaseUrl: string) => ({
    [OIDC_ISSUER_ENV]: issuer,
    OIDC_CLIENT_ID,
    OIDC_AUDIENCE,
    APP_BASE_URL: appBaseUrl,
})

const tokenResponseSchema = z.object({ access_token: z.string().nonempty() })

/**
 * @description Mints an access token of the provider, through the client credentials grant
 * @param issuer Issuer of the started provider
 * @param scope Scope of the request, which selects the claims of the token
 * @throws When the provider does not answer a token
 * @remarks Skips the browser round trip, which a backend suite has no use for
 */
export const mintAccessToken = async (
    issuer: string,
    scope = "openid",
): Promise<string> => {
    const response = await fetch(`${issuer}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: OIDC_CLIENT_ID,
            client_secret: "secret",
            scope,
            audience: OIDC_AUDIENCE,
        }),
    })

    if (!response.ok) {
        throw new Error(
            `The mock provider refused a token: ${String(response.status)} ${await response.text()}`,
        )
    }

    // The answer of another process: a boundary, so a schema reads it.
    return tokenResponseSchema.parse(await response.json()).access_token
}
