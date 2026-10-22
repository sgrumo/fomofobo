import { faker } from "@faker-js/faker"
import axios from "axios"
import { expectRawStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import type { Account, AccountRole, OrganizerCreation } from "models"
import { accountSchema } from "models"

export type AccountSeed = OrganizerCreation & { role: AccountRole }

/**
 * @description Builds the name, email, password and role of an account to seed
 * @param role Role of the account
 */
export const buildAccountSeed = (role: AccountRole): AccountSeed => ({
    name: faker.company.name(),
    // A random email collides over a suite that never resets its database
    email: `${crypto.randomUUID()}@${faker.internet.domainName()}`,
    password: faker.internet.password({ length: 16 }),
    role,
})

/**
 * @description Persists an account through the seed route the app serves under `APP_ENV=test`
 * @param seed Name, email, password and role of the account
 */
export const seedAccount = async (seed: AccountSeed): Promise<Account> => {
    const res = await axios.post(`${publishedAppUrl()}/api/test/accounts`, seed, {
        validateStatus: () => true,
    })
    expectRawStatus(res, 201)
    return accountSchema.parse(res.data)
}

/**
 * @description Sends the email and password to the sign-in endpoint and returns the response
 * @param credentials Email and password sent
 */
export const signIn = async (credentials: { email: string; password: string }) =>
    await axios.post(`${publishedAppUrl()}/api/auth/sign-in/email`, credentials, {
        validateStatus: () => true,
    })

/**
 * @description Returns the `Cookie` header that replays the cookies a response set
 * @param setCookie `Set-Cookie` values of the response
 */
export const toCookieHeader = (setCookie: string[] | undefined): string =>
    (setCookie ?? []).map(cookie => cookie.split(";")[0]).join("; ")

/**
 * @description Seeds an account of the role, signs it in, and returns it with the headers of its session
 * @param role Role of the account
 */
export const signInAs = async (
    role: AccountRole,
): Promise<{ account: Account; headers: { Cookie: string } }> => {
    const seed = buildAccountSeed(role)
    const account = await seedAccount(seed)
    const session = await signIn(seed)
    expectRawStatus(session, 200)
    return { account, headers: { Cookie: toCookieHeader(session.headers["set-cookie"]) } }
}
