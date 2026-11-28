import { and, countDistinct, gte, lte } from "drizzle-orm"
import type { ActiveDeviceCheckIn, ActiveDeviceCount, ActiveDevicePlatform } from "models"

import type { DbInstanceFromSchema } from "../db-config"
import { activeDeviceDays } from "../db-schema"

export interface ActiveDeviceWindows {
    day: string
    week: string
    month: string
}

export interface ActiveDeviceCounts {
    day: ActiveDeviceCount[]
    week: ActiveDeviceCount[]
    month: ActiveDeviceCount[]
    daily: Array<{ date: string; platform: ActiveDevicePlatform; devices: number }>
}

export class ActiveDevicesStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Persists the use of the app by a device on a local date; a second use on that date changes nothing
     * @param checkIn Device, platform and app version
     * @param localDate Local date of the use
     */
    public async record(checkIn: ActiveDeviceCheckIn, localDate: string): Promise<void> {
        await this.db
            .insert(activeDeviceDays)
            .values({
                deviceId: checkIn.deviceId,
                localDate,
                platform: checkIn.platform,
                appVersion: checkIn.appVersion,
            })
            .onConflictDoNothing()
    }

    /**
     * @description Fetches the distinct devices of each platform in each window up to a last date, and the devices of each date and platform of the month window
     * @param firstDates First local date of the day, week and month windows
     * @param lastDate Last local date of every window
     */
    public async countDevices(
        firstDates: ActiveDeviceWindows,
        lastDate: string,
    ): Promise<ActiveDeviceCounts> {
        const between = (firstDate: string) =>
            and(
                gte(activeDeviceDays.localDate, firstDate),
                lte(activeDeviceDays.localDate, lastDate),
            )
        const countFrom = (firstDate: string) =>
            this.db
                .select({
                    platform: activeDeviceDays.platform,
                    devices: countDistinct(activeDeviceDays.deviceId),
                })
                .from(activeDeviceDays)
                .where(between(firstDate))
                .groupBy(activeDeviceDays.platform)
                .orderBy(activeDeviceDays.platform)
        const [day, week, month, daily] = await this.db.batch([
            countFrom(firstDates.day),
            countFrom(firstDates.week),
            countFrom(firstDates.month),
            this.db
                .select({
                    date: activeDeviceDays.localDate,
                    platform: activeDeviceDays.platform,
                    devices: countDistinct(activeDeviceDays.deviceId),
                })
                .from(activeDeviceDays)
                .where(between(firstDates.month))
                .groupBy(activeDeviceDays.localDate, activeDeviceDays.platform)
                .orderBy(activeDeviceDays.localDate, activeDeviceDays.platform),
        ])
        return { day, week, month, daily }
    }
}
