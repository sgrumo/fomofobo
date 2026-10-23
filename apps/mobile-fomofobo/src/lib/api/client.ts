import { createApi } from "api-client/requests"
import { nativeApplicationVersion } from "expo-application"
import type { ClientPlatform } from "models"
import { Platform } from "react-native"
import { match } from "ts-pattern"

import { env } from "@/lib/env"

import { createApiRequest } from "./transport"

/**
 * @description Returns the headers identifying the running app build
 * @remarks Sends each value on its own. So the web target, which has no store
 * platform, still reports its version, and the backend sees a partial identity
 * instead of an empty request
 */
const clientHeaders = (): Record<string, string> => {
    const platform = match(Platform.OS)
        .returnType<ClientPlatform | undefined>()
        .with("ios", "android", storePlatform => storePlatform)
        .otherwise(() => undefined)

    return {
        ...(platform === undefined ? {} : { "x-app-platform": platform }),
        ...(!env.versioned || nativeApplicationVersion === null
            ? {}
            : { "x-app-version": nativeApplicationVersion }),
    }
}

export const api = createApi({
    request: createApiRequest(env.apiUrl, clientHeaders()),
})
