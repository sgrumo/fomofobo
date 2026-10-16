import { parseArgs } from "node:util"

import { hashPassword } from "better-auth/crypto"
import {
    accountPasswordSchema,
    accountSchema,
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH,
} from "models"
import { AccountsStorage, buildDbInstance } from "storage"

import { readHiddenPair } from "./read-hidden"

const USAGE = `Usage:
  DATABASE_URL=<url> pnpm admin-accounts create-admin --name <name> --email <email>
  DATABASE_URL=<url> pnpm admin-accounts reset-password --email <email>

DATABASE_URL is a file: URL, or the libsql: URL of Turso with DATABASE_AUTH_TOKEN.
The password comes from a prompt.`

/**
 * @description Returns the email of the option in lower case
 * @param email Email of the `--email` option
 * @throws When the option is absent or holds no email
 */
const parseEmail = (email: string | undefined): string => {
    const parsed = accountSchema.shape.email.safeParse(email?.toLowerCase())
    if (!parsed.success) {
        throw new Error(`--email needs a valid email\n\n${USAGE}`)
    }
    return parsed.data
}

/**
 * @description Returns the hash of a new password typed twice at the prompt
 * @throws When the two inputs differ or the password breaks the length limits
 * @remarks Matches the app hash only while its auth config keeps the default hasher
 */
const readNewPasswordHash = async (): Promise<string> => {
    const [password, confirmation] = await readHiddenPair(
        "New password: ",
        "Repeat the new password: ",
    )
    if (password !== confirmation) {
        throw new Error("The two passwords differ")
    }
    if (!accountPasswordSchema.safeParse(password).success) {
        throw new Error(
            `The password needs ${String(MIN_PASSWORD_LENGTH)} to ${String(MAX_PASSWORD_LENGTH)} characters`,
        )
    }
    return await hashPassword(password)
}

/**
 * @description Persists a new Admin account with the password typed at the prompt
 * @param accountsStorage Storage of the target database
 * @param options Values of the `--name` and `--email` options
 * @throws When an option is invalid or an account already holds the email
 */
const createAdmin = async (
    accountsStorage: AccountsStorage,
    options: { name?: string; email?: string },
): Promise<void> => {
    const name = accountSchema.shape.name.safeParse(options.name)
    if (!name.success) {
        throw new Error(`--name needs a name of 1 to 120 characters\n\n${USAGE}`)
    }
    const email = parseEmail(options.email)
    if ((await accountsStorage.findByEmail(email)) !== null) {
        throw new Error(`An account already holds ${email}`)
    }

    const passwordHash = await readNewPasswordHash()
    await accountsStorage.createWithPassword(
        {
            id: crypto.randomUUID(),
            name: name.data,
            email,
            role: "admin",
            createdAt: new Date(),
        },
        { id: crypto.randomUUID(), passwordHash },
    )
    console.log(`Admin ${email} created`)
}

/**
 * @description Persists the password typed at the prompt for an existing account and ends
 * its sessions
 * @param accountsStorage Storage of the target database
 * @param options Value of the `--email` option
 * @throws When the option is invalid or no account holds the email
 */
const resetPassword = async (
    accountsStorage: AccountsStorage,
    options: { email?: string },
): Promise<void> => {
    const email = parseEmail(options.email)
    const account = await accountsStorage.findByEmail(email)
    if (account === null) {
        throw new Error(`No account holds ${email}`)
    }

    const passwordHash = await readNewPasswordHash()
    await accountsStorage.replacePasswordAndEndSessions(
        account.id,
        { id: crypto.randomUUID(), passwordHash },
        new Date(),
    )
    console.log(`Password of ${email} set, every session of the account ended`)
}

/**
 * @description Runs the command of the arguments against the database of `DATABASE_URL`
 * @throws When the command is unknown or `DATABASE_URL` is absent
 */
const main = async (): Promise<void> => {
    const { positionals, values } = parseArgs({
        allowPositionals: true,
        options: { name: { type: "string" }, email: { type: "string" } },
    })
    const url = process.env.DATABASE_URL
    if (url === undefined) {
        throw new Error(`Set DATABASE_URL\n\n${USAGE}`)
    }
    const accountsStorage = new AccountsStorage(
        buildDbInstance({ url, authToken: process.env.DATABASE_AUTH_TOKEN }),
    )

    const [command] = positionals
    if (command === "create-admin") {
        await createAdmin(accountsStorage, values)
    } else if (command === "reset-password") {
        await resetPassword(accountsStorage, values)
    } else {
        throw new Error(USAGE)
    }
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
})
