import { match } from "ts-pattern"

/**
 * @description Names the build environment, with a schema in `env.ts` and an identity in
 * `resolveTarget`
 * @remarks Drives every environment-shaped value through `APP_ENV` alone:
 * - `local` — `expo start` and `expo run:*` on a workstation, and the quality builds
 * - `dev` — the tester lanes
 * - `prod` — the store lanes
 */
export const appEnvValues = ["local", "dev", "prod"] as const
export type AppEnv = (typeof appEnvValues)[number]

export interface Target {
    appIdSuffix: string
    scheme: string
    firebaseDir: string
}

/**
 * @description Returns the identity a build of the environment installs under
 * @param appEnv Environment of the build
 * @remarks Keeps `prod` alone on the store identity, so a local or tester build never
 * replaces the store app on a device
 */
export const resolveTarget = (appEnv: AppEnv): Target =>
    match(appEnv)
        .returnType<Target>()
        .with("local", "dev", () => ({
            appIdSuffix: ".dev",
            scheme: "fomofobodev",
            firebaseDir: "firebase/dev",
        }))
        .with("prod", () => ({
            appIdSuffix: "",
            scheme: "fomofobo",
            firebaseDir: "firebase/prod",
        }))
        .exhaustive()
