import type { StartedTestContainer } from "testcontainers"
import { GenericContainer, Wait } from "testcontainers"

export type { StartedTestContainer }

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
