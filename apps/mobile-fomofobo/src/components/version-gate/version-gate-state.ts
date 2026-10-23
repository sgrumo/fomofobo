import type { ClientCompatibility } from "models"
import { match } from "ts-pattern"

export type VersionGateScreen =
    | { kind: "hidden" }
    | { kind: "popup"; storeUrl: string | undefined }
    | {
          kind: "blocked"
          reason: "update-required" | "maintenance"
          storeUrl: string | undefined
      }

/**
 * @description Returns the screen the gate must show for one answer
 * @param answer Last answer the server gave, `undefined` before the first one
 * @remarks Yields `hidden` while no answer exists, so a failed first request
 * never blocks a user. TanStack Query keeps the last answer through a failed
 * refetch, so an active block holds until a new answer replaces it
 */
export const resolveVersionGateScreen = (
    answer: ClientCompatibility | undefined,
): VersionGateScreen =>
    match(answer)
        .returnType<VersionGateScreen>()
        .with(undefined, () => ({ kind: "hidden" }))
        .with({ action: "ok" }, () => ({ kind: "hidden" }))
        .with({ action: "update-optional" }, current => ({
            kind: "popup",
            storeUrl: current.storeUrl,
        }))
        .with({ action: "update-required" }, current => ({
            kind: "blocked",
            reason: "update-required",
            storeUrl: current.storeUrl,
        }))
        .with({ action: "maintenance" }, () => ({
            kind: "blocked",
            reason: "maintenance",
            storeUrl: undefined,
        }))
        .exhaustive()

/**
 * @description True while the gate blocks the whole app
 * @param answer Last answer the server gave
 */
export const isVersionGateBlocking = (answer: ClientCompatibility | undefined): boolean =>
    resolveVersionGateScreen(answer).kind === "blocked"
