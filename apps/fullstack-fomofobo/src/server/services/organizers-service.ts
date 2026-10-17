import "server-only"
import type { Account, OrganizerCreation, OrganizerListQuery } from "models"
import type { AccountsStorage } from "storage"

import { expireTags, PUBLIC_TAG } from "../cache"
import { appError } from "../errors"
import type { AuthAccountsService } from "./auth-accounts-service"
import type { Page } from "./to-page"
import { toPage } from "./to-page"

export class OrganizersService {
    private readonly authAccounts: AuthAccountsService
    private readonly accountsStorage: AccountsStorage
    public constructor(
        authAccounts: AuthAccountsService,
        accountsStorage: AccountsStorage,
    ) {
        this.authAccounts = authAccounts
        this.accountsStorage = accountsStorage
    }

    /**
     * @description Fetches one page of the organizers, ordered by name
     * @param query Page, text searched in name and email, block state
     */
    public async list(query: OrganizerListQuery): Promise<Page<Account>> {
        return toPage(await this.accountsStorage.listOrganizers(query), query)
    }

    /**
     * @description Fetches one organizer
     * @param id Account read
     */
    public async getById(id: string): Promise<Account> {
        const account = await this.authAccounts.findById(id)
        if (account?.role !== "organizer") {
            throw appError("OrganizerNotFound", `Organizer ${id} not found`)
        }
        return account
    }

    /**
     * @description Persists a new organizer that signs in with the password of the creation
     * @param creation Name, email and password of the organizer
     */
    public async create(creation: OrganizerCreation): Promise<Account> {
        return await this.authAccounts.createAccount(creation, "organizer")
    }

    /**
     * @description Persists the block state of an organizer, and ends its sessions on a block
     * @param id Account changed
     * @param blocked True to block
     */
    public async setBlocked(id: string, blocked: boolean): Promise<Account> {
        await this.getById(id)
        const account = await this.authAccounts.setBlocked(id, blocked)
        if (account === null) {
            throw appError("OrganizerNotFound", `Organizer ${id} not found`)
        }
        expireTags(PUBLIC_TAG)
        return account
    }

    /**
     * @description Persists a new password of an organizer and ends its sessions
     * @param id Account changed
     * @param password New password, in clear
     */
    public async setPassword(id: string, password: string): Promise<void> {
        await this.getById(id)
        if ((await this.authAccounts.setPassword(id, password)) === null) {
            throw appError("OrganizerNotFound", `Organizer ${id} not found`)
        }
    }
}
