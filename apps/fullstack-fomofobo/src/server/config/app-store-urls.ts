import "server-only"
import { parseEnv } from "./env"

/**
 * @description Returns the store listing of the native app on each platform, unset until the app is listed there
 * @throws When the environment misses a variable of its `APP_ENV` variant
 */
export const appStoreUrls = () => {
    const env = parseEnv(process.env)
    return { ios: env.IOS_STORE_URL, android: env.ANDROID_STORE_URL }
}
