import type { Action, FormErrors, FormResult } from "frontend-shared/types"
import type { i18n as I18nInstance } from "i18next"
import type { PlaceSuggestion, Venue, VenueCreation, VenueUpdate } from "models"
import { venueCreationSchema, venueUpdateSchema } from "models"
import { err, ok } from "shared/result"
import type { Partial, Specified } from "shared/types"
import { match } from "ts-pattern"
import { z } from "zod"

import { parseFormState } from "@/lib/forms/forms"

//#region Types

export interface VenueFormState {
    name: string | undefined
    address: string | undefined
    latitude: string | undefined
    longitude: string | undefined
    description: string | undefined
    websiteUrl: string | undefined
    instagramUrl: string | undefined
    facebookUrl: string | undefined
}

export type VenueFormAction =
    | { type: "name"; value: string | undefined }
    | { type: "address"; value: string | undefined }
    | { type: "latitude"; value: string | undefined }
    | { type: "longitude"; value: string | undefined }
    | { type: "place"; value: PlaceSuggestion }
    | { type: "pin"; value: { latitude: number; longitude: number } }
    | { type: "description"; value: string | undefined }
    | { type: "website-url"; value: string | undefined }
    | { type: "instagram-url"; value: string | undefined }
    | { type: "facebook-url"; value: string | undefined }

//#endregion

//#region Initial State

export const initialVenueFormState = (): VenueFormState => ({
    name: undefined,
    address: undefined,
    latitude: undefined,
    longitude: undefined,
    description: undefined,
    websiteUrl: undefined,
    instagramUrl: undefined,
    facebookUrl: undefined,
})

/**
 * @description Builds the form state of a stored venue
 * @param venue Venue edited
 */
export const venueFormStateFromVenue = (venue: Venue): VenueFormState => ({
    name: venue.name,
    address: venue.address,
    latitude: venue.coordinates.latitude.toString(),
    longitude: venue.coordinates.longitude.toString(),
    description: venue.description ?? undefined,
    websiteUrl: venue.links.websiteUrl ?? undefined,
    instagramUrl: venue.links.instagramUrl ?? undefined,
    facebookUrl: venue.links.facebookUrl ?? undefined,
})

//#endregion

//#region Actions

const nameAction =
    (state: VenueFormState) => (action: Action<VenueFormAction, "name">) => ({
        ...state,
        name: action.value,
    })

const addressAction =
    (state: VenueFormState) => (action: Action<VenueFormAction, "address">) => ({
        ...state,
        address: action.value,
    })

const latitudeAction =
    (state: VenueFormState) => (action: Action<VenueFormAction, "latitude">) => ({
        ...state,
        latitude: action.value,
    })

const longitudeAction =
    (state: VenueFormState) => (action: Action<VenueFormAction, "longitude">) => ({
        ...state,
        longitude: action.value,
    })

const placeAction =
    (state: VenueFormState) => (action: Action<VenueFormAction, "place">) => ({
        ...state,
        address: action.value.label,
        latitude: action.value.coordinates.latitude.toString(),
        longitude: action.value.coordinates.longitude.toString(),
    })

const pinAction =
    (state: VenueFormState) => (action: Action<VenueFormAction, "pin">) => ({
        ...state,
        latitude: action.value.latitude.toFixed(6),
        longitude: action.value.longitude.toFixed(6),
    })

const descriptionAction =
    (state: VenueFormState) => (action: Action<VenueFormAction, "description">) => ({
        ...state,
        description: action.value,
    })

const websiteUrlAction =
    (state: VenueFormState) => (action: Action<VenueFormAction, "website-url">) => ({
        ...state,
        websiteUrl: action.value,
    })

const instagramUrlAction =
    (state: VenueFormState) => (action: Action<VenueFormAction, "instagram-url">) => ({
        ...state,
        instagramUrl: action.value,
    })

const facebookUrlAction =
    (state: VenueFormState) => (action: Action<VenueFormAction, "facebook-url">) => ({
        ...state,
        facebookUrl: action.value,
    })

//#endregion

//#region Reducer

export const venueFormReducer = (
    state: VenueFormState,
    action: VenueFormAction,
): VenueFormState =>
    match(action)
        .with({ type: "name" }, nameAction(state))
        .with({ type: "address" }, addressAction(state))
        .with({ type: "latitude" }, latitudeAction(state))
        .with({ type: "longitude" }, longitudeAction(state))
        .with({ type: "place" }, placeAction(state))
        .with({ type: "pin" }, pinAction(state))
        .with({ type: "description" }, descriptionAction(state))
        .with({ type: "website-url" }, websiteUrlAction(state))
        .with({ type: "instagram-url" }, instagramUrlAction(state))
        .with({ type: "facebook-url" }, facebookUrlAction(state))
        .exhaustive()

//#endregion

//#region Conversions

/**
 * @description Returns the number a coordinate field holds, absent while empty
 * @param value Text of the field
 */
export const coordinateOf = (value: string | undefined): number | undefined =>
    value === undefined || value.trim() === "" ? undefined : Number(value)

/**
 * @description Maps the venue form to the fields of a venue
 * @param state Venue form state
 * @param i18n Instance translating the field errors
 */
export const venueFormStateToCreation = (
    state: VenueFormState,
    i18n: I18nInstance,
): FormResult<VenueFormState, VenueCreation> => {
    const parsed = parseFormState(
        venueCreationSchema,
        {
            name: state.name,
            address: state.address,
            coordinates: {
                latitude: coordinateOf(state.latitude),
                longitude: coordinateOf(state.longitude),
            },
        } satisfies Specified<Partial<VenueCreation>>,
        i18n,
    )
    if (parsed.success) {
        return ok(parsed.data)
    }

    const tree = z.treeifyError(parsed.error).properties ?? {}
    return err({
        name: tree.name,
        address: tree.address,
        latitude: tree.coordinates?.properties?.latitude,
        longitude: tree.coordinates?.properties?.longitude,
        description: undefined,
        websiteUrl: undefined,
        instagramUrl: undefined,
        facebookUrl: undefined,
    } satisfies Specified<FormErrors<VenueFormState>, { mode: "shallow" }>)
}

/**
 * @description Maps the venue form to the update of a venue, an emptied field to `null`
 * @param state Venue form state
 * @param i18n Instance translating the field errors
 */
export const venueFormStateToUpdate = (
    state: VenueFormState,
    i18n: I18nInstance,
): FormResult<VenueFormState, VenueUpdate> => {
    const parsed = parseFormState(
        venueUpdateSchema,
        {
            name: state.name,
            address: state.address,
            coordinates: {
                latitude: coordinateOf(state.latitude),
                longitude: coordinateOf(state.longitude),
            },
            description: state.description ?? null,
            links: {
                websiteUrl: state.websiteUrl ?? null,
                instagramUrl: state.instagramUrl ?? null,
                facebookUrl: state.facebookUrl ?? null,
            },
            coverPhotoKey: undefined,
        } satisfies Specified<Partial<VenueUpdate>>,
        i18n,
    )
    if (parsed.success) {
        return ok(parsed.data)
    }

    const tree = z.treeifyError(parsed.error).properties ?? {}
    const coordinates =
        tree.coordinates !== undefined && "properties" in tree.coordinates
            ? tree.coordinates.properties
            : undefined
    const links =
        tree.links !== undefined && "properties" in tree.links
            ? tree.links.properties
            : undefined
    return err({
        name: tree.name,
        address: tree.address,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        description: tree.description,
        websiteUrl: links?.websiteUrl,
        instagramUrl: links?.instagramUrl,
        facebookUrl: links?.facebookUrl,
    } satisfies Specified<FormErrors<VenueFormState>, { mode: "shallow" }>)
}

//#endregion
