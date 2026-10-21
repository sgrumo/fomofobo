import { eq } from "drizzle-orm"
import type { PlatformSettings, PlatformSettingsUpdate } from "models"

import type { DbInstanceFromSchema } from "../db-config"
import { accounts, platformSettings } from "../db-schema"

const SETTINGS_ROW_ID = 1

export class SettingsStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Fetches the platform settings with the Admin who saved them last, or `null` when none were saved
     */
    public async get(): Promise<PlatformSettings | null> {
        const [row] = await this.db
            .select({
                endedVisibleDays: platformSettings.endedVisibleDays,
                participantThreshold: platformSettings.participantThreshold,
                updatedAt: platformSettings.updatedAt,
                updatedById: accounts.id,
                updatedByName: accounts.name,
            })
            .from(platformSettings)
            .leftJoin(accounts, eq(accounts.id, platformSettings.updatedBy))
            .where(eq(platformSettings.id, SETTINGS_ROW_ID))
        return row
            ? {
                  endedVisibleDays: row.endedVisibleDays,
                  participantThreshold: row.participantThreshold,
                  updatedAt: row.updatedAt.toISOString(),
                  updatedBy:
                      row.updatedById === null || row.updatedByName === null
                          ? null
                          : { id: row.updatedById, name: row.updatedByName },
              }
            : null
    }

    /**
     * @description Persists the platform settings, inserting the row on the first save
     * @param fields Values saved
     * @param updatedBy Account that saves them
     * @param updatedAt Instant of the save
     */
    public async save(
        fields: PlatformSettingsUpdate,
        updatedBy: string,
        updatedAt: Date,
    ): Promise<void> {
        const values = {
            endedVisibleDays: fields.endedVisibleDays,
            participantThreshold: fields.participantThreshold,
            updatedBy,
            updatedAt,
        }
        await this.db
            .insert(platformSettings)
            .values({ id: SETTINGS_ROW_ID, ...values })
            .onConflictDoUpdate({ target: platformSettings.id, set: values })
    }
}
