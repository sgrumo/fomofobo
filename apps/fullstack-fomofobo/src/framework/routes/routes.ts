import { languageKeys, languageKeySchema } from "i18n/i18n"
import { dateFilterKindSchema, localDateSchema } from "models"
import { z } from "zod"

import {
    createDynamicRoute,
    createRouteHandler,
    createStaticRoute,
} from "./routes.helper"

/**
 * @description Builds the codec of one coordinate read from the URL
 * @param limit Largest absolute value of the coordinate
 */
const coordinateCodec = (limit: number) =>
    z.codec(z.string().regex(z.regexes.number), z.number().min(-limit).max(limit), {
        decode: Number,
        encode: value => value.toString(),
    })

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
    root: createDynamicRoute({
        segments: ["[lang]"],
        title: ({ t }) => t("PageTitle.Home"),
        parametersSchema: z.object({ lang: languageKeySchema }),
        querySchema: z.object({
            lat: coordinateCodec(90).optional().catch(undefined),
            lng: coordinateCodec(180).optional().catch(undefined),
            place: z.string().trim().min(1).optional().catch(undefined),
            q: z.string().trim().min(1).optional().catch(undefined),
            category: z.uuid().optional().catch(undefined),
            date: dateFilterKindSchema.optional().catch(undefined),
            from: localDateSchema.optional().catch(undefined),
            to: localDateSchema.optional().catch(undefined),
            event: z.uuid().optional().catch(undefined),
            occurrence: localDateSchema.optional().catch(undefined),
        }),
        queryOptions: { event: { push: true } },
    }),
    eventDetail: createDynamicRoute({
        segments: ["[lang]", "events", "[eventId]", "[date]"],
        title: ({ t }) => t("PageTitle.Event"),
        parametersSchema: z.object({
            lang: languageKeySchema,
            eventId: z.string(),
            date: z.string(),
        }),
        querySchema: z.object({}),
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
    backofficeEvents: createDynamicRoute({
        segments: ["backoffice", "events"],
        title: ({ t }) => t("PageTitle.Backoffice.Events"),
        parametersSchema: z.object({}),
        querySchema: z.object({
            ...backofficeListQuery,
            state: blockedFilterSchema.optional().catch(undefined),
            organizer: z.uuid().optional().catch(undefined),
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
        querySchema: z.object(backofficeListQuery),
    }),
    backofficeCategories: createDynamicRoute({
        segments: ["backoffice", "categories"],
        title: ({ t }) => t("PageTitle.Backoffice.Categories"),
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
    serviceWorker: createRouteHandler({ segments: ["serwist", "[path]"] }),
} as const

export type RouteKey = keyof typeof routes

export interface RouteClientComponentProps<TKey extends RouteKey> {
    route: TKey
}
