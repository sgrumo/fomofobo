import "server-only"
import { localDateOf } from "domain/local-format"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import type { ActiveDeviceCheckIn, ActiveDeviceStats } from "models"
import type { ActiveDevicesStorage, RateLimitsStorage } from "storage"

import { appError } from "../errors"
import { rateLimitClientOf } from "./rate-limit-client"

// Phones on mobile data often share one public address, so the limit leaves room for many devices
const CHECK_INS_PER_WINDOW = 300
const CHECK_IN_WINDOW_MS = 10 * 60_000
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * @description Returns the local date a number of days before a local date
 * @param localDate Local date counted from, as `YYYY-MM-DD`
 * @param days Days back
 */
const daysBefore = (localDate: string, days: number): string =>
    new Date(new Date(`${localDate}T00:00:00Z`).getTime() - days * DAY_MS)
        .toISOString()
        .slice(0, 10)

export class ActiveDevicesService {
    private readonly activeDevicesStorage: ActiveDevicesStorage
    private readonly rateLimitsStorage: RateLimitsStorage
    public constructor(
        activeDevicesStorage: ActiveDevicesStorage,
        rateLimitsStorage: RateLimitsStorage,
    ) {
        this.activeDevicesStorage = activeDevicesStorage
        this.rateLimitsStorage = rateLimitsStorage
    }

    /**
     * @description Persists the use of the app by a device on the local date of the platform, once per date
     * @param checkIn Anonymous device id, platform and app version
     * @param forwardedFor `x-forwarded-for` header of the request
     * @param now Instant of the use
     * @throws When the client made too many check-ins in the window
     */
    public async checkIn(
        checkIn: ActiveDeviceCheckIn,
        forwardedFor: string | undefined,
        now: Date,
    ): Promise<void> {
        const calls = await this.rateLimitsStorage.hit(
            `active-devices:${rateLimitClientOf(forwardedFor)}`,
            now,
            CHECK_IN_WINDOW_MS,
        )
        if (calls > CHECK_INS_PER_WINDOW) {
            throw appError("TooManyRequests", "Too many check-ins from this client")
        }
        await this.activeDevicesStorage.record(
            checkIn,
            localDateOf(now, PLATFORM_TIME_ZONE),
        )
    }

    /**
     * @description Fetches the distinct active devices of each platform today, in the last 7 days and in the last 30 days, with the devices of each day
     * @param now Instant that sets today
     */
    public async stats(now: Date): Promise<ActiveDeviceStats> {
        const today = localDateOf(now, PLATFORM_TIME_ZONE)
        const counts = await this.activeDevicesStorage.countDevices(
            { day: today, week: daysBefore(today, 6), month: daysBefore(today, 29) },
            today,
        )
        return {
            today: counts.day,
            last7Days: counts.week,
            last30Days: counts.month,
            daily: counts.daily,
        }
    }
}
