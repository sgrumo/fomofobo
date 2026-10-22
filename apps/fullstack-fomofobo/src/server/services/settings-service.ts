import "server-only"
import { DEFAULT_ENDED_VISIBLE_DAYS, DEFAULT_PARTICIPANT_THRESHOLD } from "models"
import type { Account, PlatformSettings, PlatformSettingsUpdate } from "models"
import { unstable_cache } from "next/cache"
import type { SettingsStorage } from "storage"

import { expireTags, SETTINGS_TAG } from "../cache"

const DEFAULT_SETTINGS: PlatformSettings = {
    endedVisibleDays: DEFAULT_ENDED_VISIBLE_DAYS,
    participantThreshold: DEFAULT_PARTICIPANT_THRESHOLD,
    updatedAt: null,
    updatedBy: null,
}

export class SettingsService {
    private readonly settingsStorage: SettingsStorage
    public constructor(settingsStorage: SettingsStorage) {
        this.settingsStorage = settingsStorage
    }

    /**
     * @description Fetches the platform settings from the cache, the defaults while no Admin saved them
     */
    public async get(): Promise<PlatformSettings> {
        return await unstable_cache(
            async () => (await this.settingsStorage.get()) ?? DEFAULT_SETTINGS,
            ["settings"],
            { tags: [SETTINGS_TAG] },
        )()
    }

    /**
     * @description Persists the platform settings and returns them with the Admin who saved them
     * @param fields Values saved
     * @param account Admin who saves them
     */
    public async update(
        fields: PlatformSettingsUpdate,
        account: Account,
    ): Promise<PlatformSettings> {
        const updatedAt = new Date()
        await this.settingsStorage.save(fields, account.id, updatedAt)
        expireTags(SETTINGS_TAG)
        return {
            ...fields,
            updatedAt: updatedAt.toISOString(),
            updatedBy: { id: account.id, name: account.name },
        }
    }

    /**
     * @description Fetches the instant an ended occurrence must end after to stay in the public app
     * @param now Current instant
     */
    public async endedVisibleSince(now: Date): Promise<Date> {
        const { endedVisibleDays } = await this.get()
        return new Date(now.getTime() - endedVisibleDays * 24 * 60 * 60 * 1000)
    }
}
