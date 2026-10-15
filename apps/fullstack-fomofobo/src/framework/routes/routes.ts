import { languageKeys, languageKeySchema } from "i18n/i18n"
import { z } from "zod"

import {
    createDynamicRoute,
    createRouteHandler,
    createStaticRoute,
} from "./routes.helper"

export const routes = {
    root: createStaticRoute({
        segments: ["[lang]"],
        title: ({ t }) => t("PageTitle.Home"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        generateStaticParams: () => languageKeys.map(lang => ({ lang })),
    }),
    devShowcase: createDynamicRoute({
        segments: ["[lang]", "dev", "showcase"],
        title: ({ t }) => t("PageTitle.DevShowcase"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        querySchema: z.object({}),
    }),
    devSamples: createDynamicRoute({
        segments: ["[lang]", "dev", "samples"],
        title: ({ t }) => t("PageTitle.DevSamples"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        querySchema: z.object({}),
    }),
    localizedNotFound: createDynamicRoute({
        segments: ["[lang]", "[...rest]"],
        title: ({ t }) => t("PageTitle.NotFound"),
        parametersSchema: z.object({
            lang: languageKeySchema,
            rest: z.array(z.string()),
        }),
        querySchema: z.object({}),
    }),
} as const

export const routeHandlers = {
    api: createRouteHandler({ segments: ["api", "[[...route]]"] }),
    authLogin: createRouteHandler({ segments: ["auth", "login"] }),
    authCallback: createRouteHandler({ segments: ["auth", "callback"] }),
    authRefresh: createRouteHandler({ segments: ["auth", "refresh"] }),
    authLogout: createRouteHandler({ segments: ["auth", "logout"] }),
} as const

export type RouteKey = keyof typeof routes

export interface RouteClientComponentProps<TKey extends RouteKey> {
    route: TKey
}
