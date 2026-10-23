import "server-only"
import { logger } from "backend-shared"
import type { ClientCompatibility, ClientPlatform, Semver } from "models"
import { semverSchema } from "models"
import { isVersionLower } from "shared/semver"
import { match } from "ts-pattern"

export interface PlatformPolicy {
    minVersion: Semver | undefined
    currentVersion: Semver | undefined
    releaseLive: boolean | undefined
    storeUrl: string | undefined
}

export type ClientPolicy = Record<ClientPlatform, PlatformPolicy>

interface PolicyFacts {
    blocked: boolean
    outdated: boolean
    releaseLive: boolean
    hasStoreUrl: boolean
}

/**
 * @description Maps the facts of one request to the action the app must take
 * @param facts Comparison results for the calling build
 * @remarks Reads an absent store URL as nothing to install: a blocked build gets
 * `maintenance`, an outdated build gets `ok`
 */
const resolveAction = (facts: PolicyFacts): ClientCompatibility["action"] =>
    match(facts)
        .returnType<ClientCompatibility["action"]>()
        .with({ blocked: true, releaseLive: false }, () => "maintenance")
        .with({ blocked: true, hasStoreUrl: false }, () => "maintenance")
        .with({ blocked: true }, () => "update-required")
        .with({ outdated: true, hasStoreUrl: true }, () => "update-optional")
        .otherwise(() => "ok")

/**
 * @description Returns the compatibility answer for one platform and version
 * @param policy Rules of the calling platform
 * @param version Version the app reports
 * @remarks Blocks nobody while `minVersion` is absent, and nudges nobody while
 * `currentVersion` is absent, so an unconfigured deployment leaves the gate asleep
 * @remarks Yields `ok` for a version `semver` cannot compare, so a broken header
 * never blocks a user
 */
export const resolveClientCompatibility = (
    policy: PlatformPolicy,
    version: string,
): ClientCompatibility => {
    const parsed = semverSchema.safeParse(version)
    if (!parsed.success) {
        return { action: "ok" }
    }

    const action = resolveAction({
        blocked:
            policy.minVersion !== undefined &&
            isVersionLower(parsed.data, policy.minVersion),
        outdated:
            policy.currentVersion !== undefined &&
            isVersionLower(parsed.data, policy.currentVersion),
        // Absent reads as live: a forgotten `false` strands users on maintenance
        // while the update sits in the store.
        releaseLive: policy.releaseLive ?? true,
        hasStoreUrl: policy.storeUrl !== undefined,
    })

    return match(action)
        .with("update-optional", "update-required", updateAction => ({
            action: updateAction,
            storeUrl: policy.storeUrl,
        }))
        .with("ok", "maintenance", otherAction => ({ action: otherAction }))
        .exhaustive()
}

export class ClientCompatibilityService {
    private readonly policy: ClientPolicy
    public constructor(policy: ClientPolicy) {
        this.policy = policy
    }

    /**
     * @description Returns the action the calling app build must take
     * @param platform Store the build comes from, absent for a non-mobile caller
     * @param version Version the app reports, absent for a non-mobile caller
     * @remarks Yields `ok` for an incomplete identity, so a caller that is not the
     * mobile app never gets blocked
     */
    public check(
        platform: ClientPlatform | undefined,
        version: string | undefined,
    ): ClientCompatibility {
        if (platform === undefined || version === undefined) {
            if (platform !== undefined || version !== undefined) {
                logger.warn("Incomplete client identity on the version gate", {
                    platform,
                    hasVersion: version !== undefined,
                })
            }
            return { action: "ok" }
        }

        return resolveClientCompatibility(this.policy[platform], version)
    }
}
