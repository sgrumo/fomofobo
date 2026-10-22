import axios from "axios"
import { expectApiError, expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { anyHttpUrl } from "e2e-kit/matchers"
import { MAX_UPLOAD_SIZE_BYTES } from "models"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createPhotoUploadTicket } from "./api"

describe("POST /api/backoffice/photos/upload-ticket", () => {
    it("answers a presigned PUT under a key of the account, which takes the photo", async () => {
        const { account, headers } = await signInAs("organizer")
        const bytes = crypto.getRandomValues(new Uint8Array(128))

        const res = await createPhotoUploadTicket({
            headers,
            body: {
                fileName: "cover.png",
                contentType: "image/png",
                sizeBytes: bytes.byteLength,
            },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            url: anyHttpUrl,
            headers: { "Content-Type": "image/png" },
            key: expect.stringMatching(
                new RegExp(`^events/${account.id}/[0-9a-f-]{36}$`, "u"),
            ),
        })
        const upload = await fetch(res.data.url, {
            method: "PUT",
            headers: res.data.headers,
            body: bytes,
        })
        expectRawStatus(upload, 200)
    })

    it("answers 400 to a photo type other than PNG, which the typed body cannot carry", async () => {
        const { headers } = await signInAs("organizer")

        const res = await axios.post(
            `${publishedAppUrl()}/api/backoffice/photos/upload-ticket`,
            { fileName: "cover.jpg", contentType: "image/jpeg", sizeBytes: 10 },
            { headers, validateStatus: () => true },
        )

        expectRawStatus(res, 400)
        expect(res.data).toMatchObject({ code: "InvalidRequest" })
    })

    it("answers 400 to a photo past the size limit", async () => {
        const { headers } = await signInAs("organizer")

        const res = await createPhotoUploadTicket({
            headers,
            body: {
                fileName: "big.png",
                contentType: "image/png",
                sizeBytes: MAX_UPLOAD_SIZE_BYTES + 1,
            },
        })

        expectApiError(res, 400, { code: "InvalidRequest" })
    })
})
