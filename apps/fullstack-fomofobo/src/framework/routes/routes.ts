import { mapQuerySchema } from "domain/map-query"
import { languageKeys, languageKeySchema } from "i18n/i18n"
import { MAX_SEARCH_CATEGORIES } from "models"
import { z } from "zod"

import {
    createDynamicRoute,
    createRouteHandler,
    createStaticRoute,
} from "./routes.helper"

const pageCodec = z.codec(z.string().regex(/^[1-9]\d{0,5}$/u), z.int().min(1), {
    decode: Number,
    encode: value => value.toString(),
})

const backofficeListQuery = {
    q: z.string().trim().min(1).optional().catch(undefined),
    page: pageCodec.optional().catch(undefined),
}

const blockedFilterSchema = z.enum(["blocked", "active"])

export const routes = {
    root: createStaticRoute({
        segments: ["[lang]"],
        title: ({ t }) => t("PageTitle.Home"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        generateStaticParams: () => languageKeys.map(lang => ({ lang })),
    }),
    map: createDynamicRoute({
        segments: ["[lang]", "map"],
        title: ({ t }) => t("PageTitle.Map"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        querySchema: mapQuerySchema,
        queryOptions: { event: { push: true }, venue: { push: true } },
    }),
    saved: createStaticRoute({
        segments: ["[lang]", "saved"],
        title: ({ t }) => t("PageTitle.Saved"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        generateStaticParams: () => languageKeys.map(lang => ({ lang })),
    }),
    offline: createStaticRoute({
        segments: ["[lang]", "offline"],
        title: ({ t }) => t("PageTitle.Offline"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        generateStaticParams: () => languageKeys.map(lang => ({ lang })),
    }),
    privacy: createStaticRoute({
        segments: ["[lang]", "privacy"],
        title: ({ t }) => t("PageTitle.Privacy"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        generateStaticParams: () => languageKeys.map(lang => ({ lang })),
    }),
    support: createStaticRoute({
        segments: ["[lang]", "support"],
        title: ({ t }) => t("PageTitle.Support"),
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
    backoffice: createDynamicRoute({
        segments: ["backoffice"],
        title: ({ t }) => t("PageTitle.Backoffice.Events"),
        parametersSchema: z.object({}),
        querySchema: z.object({}),
    }),
    backofficeLogin: createDynamicRoute({
        segments: ["backoffice", "login"],
        title: ({ t }) => t("PageTitle.Backoffice.Login"),
        parametersSchema: z.object({}),
        querySchema: z.object({
            returnTo: z.string().optional().catch(undefined),
            reason: z.enum(["blocked"]).optional().catch(undefined),
        }),
    }),
    // The OAuth pages read the signed authorization query raw: its snake_case keys and its
    // signature cannot pass through a query schema
    backofficeOauthLogin: createDynamicRoute({
        segments: ["backoffice", "oauth-login"],
        title: ({ t }) => t("PageTitle.Backoffice.OauthLogin"),
        parametersSchema: z.object({}),
        querySchema: z.object({}),
    }),
    backofficeOauthConsent: createDynamicRoute({
        segments: ["backoffice", "oauth-consent"],
        title: ({ t }) => t("PageTitle.Backoffice.OauthConsent"),
        parametersSchema: z.object({}),
        querySchema: z.object({}),
    }),
    backofficeEvents: createDynamicRoute({
        segments: ["backoffice", "events"],
        title: ({ t }) => t("PageTitle.Backoffice.Events"),
        parametersSchema: z.object({}),
        querySchema: z.object({
            ...backofficeListQuery,
            state: blockedFilterSchema.optional().catch(undefined),
            organizer: z.uuid().optional().catch(undefined),
            categories: z
                .codec(z.string(), z.array(z.uuid()).min(1).max(MAX_SEARCH_CATEGORIES), {
                    decode: value => value.split(","),
                    encode: ids => ids.join(","),
                })
                .optional()
                .catch(undefined),
        }),
    }),
    backofficeEventNew: createDynamicRoute({
        segments: ["backoffice", "events", "new"],
        title: ({ t }) => t("PageTitle.Backoffice.NewEvent"),
        parametersSchema: z.object({}),
        querySchema: z.object({}),
    }),
    backofficeEvent: createDynamicRoute({
        segments: ["backoffice", "events", "[id]"],
        title: ({ t }) => t("PageTitle.Backoffice.Event"),
        parametersSchema: z.object({ id: z.string() }),
        querySchema: z.object({}),
    }),
    backofficeVenues: createDynamicRoute({
        segments: ["backoffice", "venues"],
        title: ({ t }) => t("PageTitle.Backoffice.Venues"),
        parametersSchema: z.object({}),
        querySchema: z.object({
            ...backofficeListQuery,
            state: blockedFilterSchema.optional().catch(undefined),
        }),
    }),
    backofficeVenue: createDynamicRoute({
        segments: ["backoffice", "venues", "[id]"],
        title: ({ t }) => t("PageTitle.Backoffice.Venue"),
        parametersSchema: z.object({ id: z.string() }),
        querySchema: z.object({}),
    }),
    backofficeCategories: createDynamicRoute({
        segments: ["backoffice", "categories"],
        title: ({ t }) => t("PageTitle.Backoffice.Categories"),
        parametersSchema: z.object({}),
        querySchema: z.object({}),
    }),
    backofficeSettings: createDynamicRoute({
        segments: ["backoffice", "settings"],
        title: ({ t }) => t("PageTitle.Backoffice.Settings"),
        parametersSchema: z.object({}),
        querySchema: z.object({}),
    }),
    backofficeOrganizers: createDynamicRoute({
        segments: ["backoffice", "organizers"],
        title: ({ t }) => t("PageTitle.Backoffice.Organizers"),
        parametersSchema: z.object({}),
        querySchema: z.object({
            ...backofficeListQuery,
            state: blockedFilterSchema.optional().catch(undefined),
        }),
    }),
    backofficeNotFound: createDynamicRoute({
        segments: ["backoffice", "[...rest]"],
        title: ({ t }) => t("PageTitle.NotFound"),
        parametersSchema: z.object({ rest: z.array(z.string()) }),
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
    authLogout: createRouteHandler({ segments: ["auth", "logout"] }),
    oauthAuthorizationServerMetadata: createRouteHandler({
        segments: [".well-known", "oauth-authorization-server", "[[...issuer]]"],
    }),
    oauthProtectedResourceMetadata: createRouteHandler({
        segments: [".well-known", "oauth-protected-resource", "[[...resource]]"],
    }),
    serviceWorker: createRouteHandler({ segments: ["serwist", "[path]"] }),
} as const

export type RouteKey = keyof typeof routes

export interface RouteClientComponentProps<TKey extends RouteKey> {
    route: TKey
}
