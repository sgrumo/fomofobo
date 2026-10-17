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
    authLogout: createRouteHandler({ segments: ["auth", "logout"] }),
} as const

export type RouteKey = keyof typeof routes

export interface RouteClientComponentProps<TKey extends RouteKey> {
    route: TKey
}
