import { languageKeys, languageKeySchema } from "i18n/i18n"
import { codecs } from "shared/zod"
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
    todos: createDynamicRoute({
        segments: ["[lang]", "todos"],
        title: ({ t }) => t("PageTitle.Todos"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        querySchema: z.object({
            page: codecs.stringToInt.pipe(z.int().min(1)).default(1).catch(1),
        }),
        queryOptions: { page: { push: true } },
    }),
    todosSearch: createDynamicRoute({
        segments: ["[lang]", "todos", "search"],
        title: ({ t }) => t("PageTitle.TodosSearch"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        querySchema: z.object({
            text: z.string().min(1).optional().catch(undefined),
            completed: z.stringbool().pipe(z.literal(true)).optional().catch(undefined),
        }),
    }),
    files: createDynamicRoute({
        segments: ["[lang]", "files"],
        title: ({ t }) => t("PageTitle.Files"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        querySchema: z.object({}),
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
