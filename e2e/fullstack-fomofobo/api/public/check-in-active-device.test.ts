import { expectApiError, expectStatus } from "e2e-kit/assertions"
import type { ActiveDeviceCheckIn } from "models"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getActiveDevices } from "../backoffice-active-devices/api"
import { checkInActiveDevice } from "./api"
import { SATURDAY_NOON } from "./utils"

describe("POST /api/public/active-devices", () => {
    it("counts each device once a day, per platform", async () => {
        const admin = await signInAs("admin")
        const phone = crypto.randomUUID()
        const browser = crypto.randomUUID()
        const checkIns: ActiveDeviceCheckIn[] = [
            { deviceId: phone, platform: "ios", appVersion: "1.4.0" },
            { deviceId: phone, platform: "ios", appVersion: "1.4.0" },
            { deviceId: browser, platform: "web", appVersion: null },
        ]
        // One call at a time: the second check-in of the phone lands after the first
        await checkIns.reduce<Promise<void>>(async (previous, body) => {
            await previous
            expectStatus(
                await checkInActiveDevice({
                    headers: { "x-test-now": SATURDAY_NOON },
                    body,
                }),
                204,
            )
        }, Promise.resolve())

        const res = await getActiveDevices({
            headers: { ...admin.headers, "x-test-now": SATURDAY_NOON },
        })

        expectStatus(res, 200)
        const counts = [
            { platform: "ios", devices: 1 },
            { platform: "web", devices: 1 },
        ]
        expect(res.data).toStrictEqual({
            today: counts,
            last7Days: counts,
            last30Days: counts,
            daily: [
                { date: "2026-10-24", platform: "ios", devices: 1 },
                { date: "2026-10-24", platform: "web", devices: 1 },
            ],
        })
    })

    it("counts a device of an earlier day in the windows that hold that day", async () => {
        const admin = await signInAs("admin")
        const days = ["2026-10-21T12:00:00+02:00", "2026-10-12T12:00:00+02:00"]
        await Promise.all(
            days.map(async now => {
                expectStatus(
                    await checkInActiveDevice({
                        headers: { "x-test-now": now },
                        body: {
                            deviceId: crypto.randomUUID(),
                            platform: "android",
                            appVersion: "1.4.0",
                        },
                    }),
                    204,
                )
            }),
        )

        const res = await getActiveDevices({
            headers: { ...admin.headers, "x-test-now": SATURDAY_NOON },
        })

        expectStatus(res, 200)
        expect([res.data.today, res.data.last7Days, res.data.last30Days]).toStrictEqual([
            [],
            [{ platform: "android", devices: 1 }],
            [{ platform: "android", devices: 2 }],
        ])
    })

    it("answers 429 past 300 check-ins of one client in ten minutes", async () => {
        const client = { "x-forwarded-for": crypto.randomUUID() }
        const body: ActiveDeviceCheckIn = {
            deviceId: crypto.randomUUID(),
            platform: "web",
            appVersion: null,
        }
        // One call at a time: the window counts the calls in the order they land
        await Array.from({ length: 300 }).reduce<Promise<void>>(async previous => {
            await previous
            expectStatus(await checkInActiveDevice({ headers: client, body }), 204)
        }, Promise.resolve())

        const res = await checkInActiveDevice({ headers: client, body })

        expectApiError(res, 429, { code: "TooManyRequests" })
    })
})
