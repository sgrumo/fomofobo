import { keepPreviousData, mutationOptions, queryOptions } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import {
    BackofficeCategoriesRoutes,
    BackofficeEventsRoutes,
    BackofficeOrganizersRoutes,
    BackofficeSessionRoutes,
    BackofficeVenuesRoutes,
    ClientCompatibilityRoutes,
    PublicRoutes,
} from "api-routes"
import { chunk } from "es-toolkit"
import { MAX_LOOKUP_REFS } from "models"
import type {
    CategoryCreation,
    CategoryUpdate,
    EventBlock,
    EventUpsert,
    OrganizerCreation,
    OrganizerPassword,
    VenueCreation,
    VenueUpdate,
} from "models"

import { cacheKeys, writeInvalidations } from "./cache-keys"
import { createEndpointFactories } from "./client"
import type { ApiClientOptions, QueryVariables } from "./client"

/**
 * @description Returns a mutation success handler invalidating the keys of one write domain
 * @param domain Write domain whose keys go stale
 */
const invalidateAfter =
    (domain: keyof typeof writeInvalidations) =>
    (_1: unknown, _2: unknown, _3: unknown, ctx: { client: QueryClient }) =>
        Promise.all(
            writeInvalidations[domain].map(queryKey =>
                ctx.client.invalidateQueries({ queryKey }),
            ),
        )

/**
 * @description Returns every request and its TanStack Query options, flat
 * @param options Transport and delay the endpoint factories bind to
 */
export const createApi = (options: ApiClientOptions) => {
    const {
        bodylessQueryEndpoint,
        responsefulMutationEndpoint,
        responselessMutationEndpoint,
    } = createEndpointFactories(options)

    const listCategories = bodylessQueryEndpoint(PublicRoutes.listCategories, 200)
    const listCategoriesQuery = (
        variables: QueryVariables<typeof PublicRoutes.listCategories>,
    ) =>
        queryOptions({
            queryFn: () => listCategories(variables),
            queryKey: cacheKeys.allCategories,
        })

    const searchOccurrences = bodylessQueryEndpoint(PublicRoutes.searchOccurrences, 200)
    const searchOccurrencesQuery = (
        variables: QueryVariables<typeof PublicRoutes.searchOccurrences>,
    ) =>
        queryOptions({
            queryFn: () => searchOccurrences(variables),
            queryKey: cacheKeys.publicOccurrenceSearch(variables),
            placeholderData: keepPreviousData,
        })

    const lookupOccurrencesChunk = bodylessQueryEndpoint(
        PublicRoutes.lookupOccurrences,
        200,
    )
    // The route caps the refs of one call.
    const lookupOccurrences = async (
        variables: QueryVariables<typeof PublicRoutes.lookupOccurrences>,
    ) => {
        const chunkResults = await Promise.all(
            chunk(variables.query.ref, MAX_LOOKUP_REFS).map(ref =>
                lookupOccurrencesChunk({ params: variables.params, query: { ref } }),
            ),
        )
        return chunkResults.flat()
    }
    const lookupOccurrencesQuery = (
        variables: QueryVariables<typeof PublicRoutes.lookupOccurrences>,
    ) =>
        queryOptions({
            queryFn: () => lookupOccurrences(variables),
            queryKey: cacheKeys.publicOccurrenceLookup(variables),
        })

    const getOccurrence = bodylessQueryEndpoint(PublicRoutes.getOccurrence, 200)
    const getOccurrenceQuery = (
        variables: QueryVariables<typeof PublicRoutes.getOccurrence>,
    ) =>
        queryOptions({
            queryFn: () => getOccurrence(variables),
            queryKey: cacheKeys.publicOccurrence(variables),
        })

    const searchPlaces = bodylessQueryEndpoint(PublicRoutes.searchPlaces, 200)
    const searchPlacesQuery = (
        variables: QueryVariables<typeof PublicRoutes.searchPlaces>,
    ) =>
        queryOptions({
            queryFn: () => searchPlaces(variables),
            queryKey: cacheKeys.placeSearch(variables),
            placeholderData: keepPreviousData,
        })

    const getMe = bodylessQueryEndpoint(BackofficeSessionRoutes.me, 200)
    const getMeQuery = (variables: QueryVariables<typeof BackofficeSessionRoutes.me>) =>
        queryOptions({
            queryFn: () => getMe(variables),
            queryKey: cacheKeys.me,
        })

    const listBackofficeEvents = bodylessQueryEndpoint(BackofficeEventsRoutes.list, 200)
    const listBackofficeEventsQuery = (
        variables: QueryVariables<typeof BackofficeEventsRoutes.list>,
    ) =>
        queryOptions({
            queryFn: () => listBackofficeEvents(variables),
            queryKey: cacheKeys.backofficeEventList(variables),
            placeholderData: keepPreviousData,
        })

    const getBackofficeEvent = bodylessQueryEndpoint(BackofficeEventsRoutes.getById, 200)
    const getBackofficeEventQuery = (
        variables: QueryVariables<typeof BackofficeEventsRoutes.getById>,
    ) =>
        queryOptions({
            queryFn: () => getBackofficeEvent(variables),
            queryKey: cacheKeys.backofficeEvent(variables),
        })

    const createEvent = responsefulMutationEndpoint(BackofficeEventsRoutes.create, 201)
    const createEventMutation = mutationOptions({
        mutationFn: (body: EventUpsert) => createEvent({ params: {}, body }),
        onSuccess: invalidateAfter("event"),
    })

    const updateEvent = responsefulMutationEndpoint(BackofficeEventsRoutes.update, 200)
    const updateEventMutation = mutationOptions({
        mutationFn: (arg: { id: string; body: EventUpsert }) =>
            updateEvent({ params: { id: arg.id }, body: arg.body }),
        onSuccess: invalidateAfter("event"),
    })

    const deleteEvent = responselessMutationEndpoint(BackofficeEventsRoutes.delete)
    const deleteEventMutation = mutationOptions({
        mutationFn: (arg: { id: string }) =>
            deleteEvent({ params: { id: arg.id }, body: undefined }),
        onSuccess: invalidateAfter("event"),
    })

    const blockEvent = responsefulMutationEndpoint(BackofficeEventsRoutes.block, 200)
    const blockEventMutation = mutationOptions({
        mutationFn: (arg: { id: string; body: EventBlock }) =>
            blockEvent({ params: { id: arg.id }, body: arg.body }),
        onSuccess: invalidateAfter("event"),
    })

    const unblockEvent = responselessMutationEndpoint(BackofficeEventsRoutes.unblock)
    const unblockEventMutation = mutationOptions({
        mutationFn: (arg: { id: string }) =>
            unblockEvent({ params: { id: arg.id }, body: undefined }),
        onSuccess: invalidateAfter("event"),
    })

    // One step of the photo flow. The app composes it with the PUT to object storage,
    // which needs a platform-specific file handle.
    const createPhotoUploadTicket = responsefulMutationEndpoint(
        BackofficeEventsRoutes.createPhotoUploadTicket,
        200,
    )

    const listVenues = bodylessQueryEndpoint(BackofficeVenuesRoutes.list, 200)
    const listVenuesQuery = (
        variables: QueryVariables<typeof BackofficeVenuesRoutes.list>,
    ) =>
        queryOptions({
            queryFn: () => listVenues(variables),
            queryKey: cacheKeys.venueList(variables),
            placeholderData: keepPreviousData,
        })

    const getVenue = bodylessQueryEndpoint(BackofficeVenuesRoutes.getById, 200)
    const getVenueQuery = (
        variables: QueryVariables<typeof BackofficeVenuesRoutes.getById>,
    ) =>
        queryOptions({
            queryFn: () => getVenue(variables),
            queryKey: cacheKeys.venue(variables),
        })

    const createVenue = responsefulMutationEndpoint(BackofficeVenuesRoutes.create, 201)
    const createVenueMutation = mutationOptions({
        mutationFn: (body: VenueCreation) => createVenue({ params: {}, body }),
        onSuccess: invalidateAfter("venue"),
    })

    const updateVenue = responsefulMutationEndpoint(BackofficeVenuesRoutes.update, 200)
    const updateVenueMutation = mutationOptions({
        mutationFn: (arg: { id: string; body: VenueUpdate }) =>
            updateVenue({ params: { id: arg.id }, body: arg.body }),
        onSuccess: invalidateAfter("venue"),
    })

    const createCategory = responsefulMutationEndpoint(
        BackofficeCategoriesRoutes.create,
        201,
    )
    const createCategoryMutation = mutationOptions({
        mutationFn: (body: CategoryCreation) => createCategory({ params: {}, body }),
        onSuccess: invalidateAfter("category"),
    })

    const updateCategory = responsefulMutationEndpoint(
        BackofficeCategoriesRoutes.update,
        200,
    )
    const updateCategoryMutation = mutationOptions({
        mutationFn: (arg: { id: string; body: CategoryUpdate }) =>
            updateCategory({ params: { id: arg.id }, body: arg.body }),
        onSuccess: invalidateAfter("category"),
    })

    const deleteCategory = responselessMutationEndpoint(BackofficeCategoriesRoutes.delete)
    const deleteCategoryMutation = mutationOptions({
        mutationFn: (arg: { id: string }) =>
            deleteCategory({ params: { id: arg.id }, body: undefined }),
        onSuccess: invalidateAfter("category"),
    })

    const listOrganizers = bodylessQueryEndpoint(BackofficeOrganizersRoutes.list, 200)
    const listOrganizersQuery = (
        variables: QueryVariables<typeof BackofficeOrganizersRoutes.list>,
    ) =>
        queryOptions({
            queryFn: () => listOrganizers(variables),
            queryKey: cacheKeys.organizerList(variables),
            placeholderData: keepPreviousData,
        })

    const getOrganizer = bodylessQueryEndpoint(BackofficeOrganizersRoutes.getById, 200)
    const getOrganizerQuery = (
        variables: QueryVariables<typeof BackofficeOrganizersRoutes.getById>,
    ) =>
        queryOptions({
            queryFn: () => getOrganizer(variables),
            queryKey: cacheKeys.organizer(variables),
        })

    const createOrganizer = responsefulMutationEndpoint(
        BackofficeOrganizersRoutes.create,
        201,
    )
    const createOrganizerMutation = mutationOptions({
        mutationFn: (body: OrganizerCreation) => createOrganizer({ params: {}, body }),
        onSuccess: invalidateAfter("organizer"),
    })

    const blockOrganizer = responselessMutationEndpoint(BackofficeOrganizersRoutes.block)
    const blockOrganizerMutation = mutationOptions({
        mutationFn: (arg: { id: string }) =>
            blockOrganizer({ params: { id: arg.id }, body: undefined }),
        onSuccess: invalidateAfter("organizer"),
    })

    const unblockOrganizer = responselessMutationEndpoint(
        BackofficeOrganizersRoutes.unblock,
    )
    const unblockOrganizerMutation = mutationOptions({
        mutationFn: (arg: { id: string }) =>
            unblockOrganizer({ params: { id: arg.id }, body: undefined }),
        onSuccess: invalidateAfter("organizer"),
    })

    const setOrganizerPassword = responselessMutationEndpoint(
        BackofficeOrganizersRoutes.setPassword,
    )
    const setOrganizerPasswordMutation = mutationOptions({
        mutationFn: (arg: { id: string; body: OrganizerPassword }) =>
            setOrganizerPassword({ params: { id: arg.id }, body: arg.body }),
        onSuccess: invalidateAfter("organizer"),
    })

    // The platform and the version travel as headers, which the transport of each app
    // adds to every request. So the call itself takes no variable.
    const checkClientCompatibility = bodylessQueryEndpoint(
        ClientCompatibilityRoutes.check,
        200,
    )
    const checkClientCompatibilityQuery = (
        variables: QueryVariables<typeof ClientCompatibilityRoutes.check>,
    ) =>
        queryOptions({
            queryFn: () => checkClientCompatibility(variables),
            queryKey: cacheKeys.allClientCompatibility,
        })

    return {
        listCategories,
        listCategoriesQuery,
        searchOccurrences,
        searchOccurrencesQuery,
        lookupOccurrences,
        lookupOccurrencesQuery,
        getOccurrence,
        getOccurrenceQuery,
        searchPlaces,
        searchPlacesQuery,
        getMe,
        getMeQuery,
        listBackofficeEvents,
        listBackofficeEventsQuery,
        getBackofficeEvent,
        getBackofficeEventQuery,
        createEvent,
        createEventMutation,
        updateEvent,
        updateEventMutation,
        deleteEvent,
        deleteEventMutation,
        blockEvent,
        blockEventMutation,
        unblockEvent,
        unblockEventMutation,
        createPhotoUploadTicket,
        listVenues,
        listVenuesQuery,
        getVenue,
        getVenueQuery,
        createVenue,
        createVenueMutation,
        updateVenue,
        updateVenueMutation,
        createCategory,
        createCategoryMutation,
        updateCategory,
        updateCategoryMutation,
        deleteCategory,
        deleteCategoryMutation,
        listOrganizers,
        listOrganizersQuery,
        getOrganizer,
        getOrganizerQuery,
        createOrganizer,
        createOrganizerMutation,
        blockOrganizer,
        blockOrganizerMutation,
        unblockOrganizer,
        unblockOrganizerMutation,
        setOrganizerPassword,
        setOrganizerPasswordMutation,
        checkClientCompatibility,
        checkClientCompatibilityQuery,
    }
}

export type Api = ReturnType<typeof createApi>
