import { createServer } from "node:http"
import type { Server } from "node:http"

import { afterAll, describe, expect, it } from "vitest"

import { S3ObjectStorage } from "./object-storage"

const bucket = "test-bucket"

/** Status code the stub store answers for each object key. */
const statusByKey: Record<string, number> = {
    "present.txt": 200,
    "missing.txt": 404,
    "forbidden.txt": 403,
}

interface Store {
    storage: S3ObjectStorage
    close: () => Promise<void>
}

/**
 * @description Starts a stub store answering each HEAD request with the status of its key
 */
const startStore = async (): Promise<Store> => {
    const server: Server = createServer((req, res) => {
        const key = (req.url ?? "").split("?")[0]?.replace(`/${bucket}/`, "") ?? ""
        const status = statusByKey[key] ?? 500
        res.statusCode = status
        if (status === 200) {
            res.setHeader("Content-Type", "text/plain")
            res.setHeader("Content-Length", "42")
        }
        res.end()
    })

    await new Promise<void>(resolve => {
        server.listen(0, "127.0.0.1", resolve)
    })

    const address = server.address()
    const port = typeof address === "object" && address !== null ? address.port : 0

    return {
        storage: new S3ObjectStorage({
            bucket,
            region: "us-east-1",
            endpoint: `http://127.0.0.1:${String(port)}`,
            accessKeyId: "test",
            secretAccessKey: "test",
        }),
        close: async (): Promise<void> => {
            await new Promise<void>(resolve => {
                server.close(() => {
                    resolve()
                })
            })
        },
    }
}

const store = await startStore()

describe("S3ObjectStorage.headObject", () => {
    afterAll(async () => {
        await store.close()
    })

    it("returns the size and content type of a present object", async () => {
        await expect(store.storage.headObject("present.txt")).resolves.toStrictEqual({
            contentType: "text/plain",
            sizeBytes: 42,
        })
    })

    it("returns null for a missing object", async () => {
        await expect(store.storage.headObject("missing.txt")).resolves.toBeNull()
    })

    it("rethrows a failure that is not a missing object", async () => {
        await expect(store.storage.headObject("forbidden.txt")).rejects.toMatchObject({
            $metadata: { httpStatusCode: 403 },
        })
    })
})

describe("S3ObjectStorage.createUploadUrl", () => {
    it("signs the content type and the length into the URL", async () => {
        const { url, headers } = await store.storage.createUploadUrl(
            "photos/a.png",
            "image/png",
            1024,
        )
        const signedHeaders = new URL(url).searchParams.get("X-Amz-SignedHeaders")

        expect(headers).toStrictEqual({ "Content-Type": "image/png" })
        expect(signedHeaders?.split(";").filter(name => name !== "host")).toStrictEqual([
            "content-length",
            "content-type",
        ])
    })
})
