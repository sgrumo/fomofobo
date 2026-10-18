import { defaultLanguage } from "i18n/i18n"
import type { MetadataRoute } from "next"

import { routes } from "@/framework/routes/routes"
import { getTranslation } from "@/lib/i18n/server/translation"
import { MAP_GROUND_COLOR } from "@/lib/pwa/pwa-colors"

/**
 * @description Builds the web app manifest of the public app, in the default language
 */
const manifest = (): MetadataRoute.Manifest => {
    const t = getTranslation(defaultLanguage)
    return {
        id: "/",
        name: "Fomofobo",
        short_name: "Fomofobo",
        description: t("App.Description"),
        lang: defaultLanguage,
        start_url: routes.root.path({ parameters: { lang: defaultLanguage }, query: {} }),
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: MAP_GROUND_COLOR,
        background_color: MAP_GROUND_COLOR,
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    }
}

export default manifest
