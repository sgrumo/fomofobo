"use client"

import { DEFAULT_CITY } from "domain/platform"
import type { FormErrors } from "frontend-shared/types"
import type { PlaceSuggestion, SearchSuggestions } from "models"
import dynamic from "next/dynamic"
import { useTranslation } from "react-i18next"
import { Combobox } from "ui-components/combobox"
import { Field } from "ui-components/field"
import { StringInput } from "ui-components/string-input"
import { Textarea } from "ui-components/textarea"

import { api } from "@/lib/api/client-api"

import type { VenueFormAction, VenueFormState } from "./venue-form.state"
import { coordinateOf, venueFormReducer } from "./venue-form.state"

const PLACE_SEARCH_MIN_LENGTH = 3

// MapLibre reads the DOM on load
const VenuePinMap = dynamic(
    () =>
        import("@/components/client/venue-pin-map/venue-pin-map").then(
            module => module.VenuePinMap,
        ),
    { ssr: false },
)

interface VenueFormProps {
    value: VenueFormState
    onValueChange: (value: VenueFormState) => void
    errors: FormErrors<VenueFormState> | undefined
    intent: "create" | "update"
    disabled?: boolean
}

export const VenueForm = (props: VenueFormProps) => {
    const { t } = useTranslation("shared")

    const onAction = (action: VenueFormAction) => {
        props.onValueChange(venueFormReducer(props.value, action))
    }

    const latitude = coordinateOf(props.value.latitude)
    const longitude = coordinateOf(props.value.longitude)
    const pin =
        latitude === undefined ||
        longitude === undefined ||
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
            ? undefined
            : { latitude, longitude }
    const bias = pin ?? DEFAULT_CITY.center

    return (
        <>
            <Field
                label={t("Backoffice.VenueForm.Name")}
                required={true}
                errors={props.errors?.name?.errors}
            >
                <StringInput
                    value={props.value.name}
                    onValueChange={name => {
                        onAction({ type: "name", value: name })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            {/* OP-28: Geoapify through the place search of the public API */}
            <Field
                label={t("Backoffice.VenueForm.Search")}
                description={t("Backoffice.VenueForm.SearchHint")}
                required={false}
            >
                <Combobox<PlaceSuggestion, SearchSuggestions>
                    type="query"
                    async={true}
                    multiple={false}
                    resettable={false}
                    minimumSearchLength={PLACE_SEARCH_MIN_LENGTH}
                    query={search => {
                        const variables = {
                            params: {},
                            query: {
                                q: search ?? "",
                                lat: bias.latitude,
                                lng: bias.longitude,
                            },
                        }
                        return {
                            queryKey: api.searchPlacesQuery(variables).queryKey,
                            queryFn: () => api.searchPlaces(variables),
                            select: (suggestions: SearchSuggestions) =>
                                suggestions.places,
                        }
                    }}
                    value={undefined}
                    onValueChange={place => {
                        if (place !== undefined) {
                            onAction({ type: "place", value: place })
                        }
                    }}
                    getItemId={place =>
                        `${place.label}@${String(place.coordinates.latitude)},${String(place.coordinates.longitude)}`
                    }
                    getItemLabel={place => place.label}
                    renderItem={({ item }) => item.label}
                    disabled={props.disabled}
                    className="w-full"
                />
            </Field>
            <Field
                label={t("Backoffice.VenueForm.Address")}
                required={true}
                errors={props.errors?.address?.errors}
            >
                <StringInput
                    value={props.value.address}
                    onValueChange={address => {
                        onAction({ type: "address", value: address })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field
                    label={t("Backoffice.VenueForm.Latitude")}
                    required={true}
                    errors={props.errors?.latitude?.errors}
                >
                    <StringInput
                        inputMode="decimal"
                        value={props.value.latitude}
                        onValueChange={value => {
                            onAction({ type: "latitude", value })
                        }}
                        disabled={props.disabled}
                    />
                </Field>
                <Field
                    label={t("Backoffice.VenueForm.Longitude")}
                    required={true}
                    errors={props.errors?.longitude?.errors}
                >
                    <StringInput
                        inputMode="decimal"
                        value={props.value.longitude}
                        onValueChange={value => {
                            onAction({ type: "longitude", value })
                        }}
                        disabled={props.disabled}
                    />
                </Field>
            </div>
            <p className="tp-body-sm">{t("Backoffice.VenueForm.MapHint")}</p>
            <VenuePinMap
                value={pin}
                onValueChange={point => {
                    onAction({ type: "pin", value: point })
                }}
                disabled={props.disabled}
            />
            {props.intent === "update" && (
                <>
                    <Field
                        label={t("Backoffice.VenueForm.Description")}
                        required={false}
                        errors={props.errors?.description?.errors}
                    >
                        <Textarea
                            value={props.value.description}
                            onValueChange={description => {
                                onAction({ type: "description", value: description })
                            }}
                            disabled={props.disabled}
                        />
                    </Field>
                    <Field
                        label={t("Backoffice.VenueForm.Website")}
                        required={false}
                        errors={props.errors?.websiteUrl?.errors}
                    >
                        <StringInput
                            inputMode="url"
                            value={props.value.websiteUrl}
                            onValueChange={url => {
                                onAction({ type: "website-url", value: url })
                            }}
                            disabled={props.disabled}
                        />
                    </Field>
                    <Field
                        label={t("Backoffice.VenueForm.Instagram")}
                        required={false}
                        errors={props.errors?.instagramUrl?.errors}
                    >
                        <StringInput
                            inputMode="url"
                            value={props.value.instagramUrl}
                            onValueChange={url => {
                                onAction({ type: "instagram-url", value: url })
                            }}
                            disabled={props.disabled}
                        />
                    </Field>
                    <Field
                        label={t("Backoffice.VenueForm.Facebook")}
                        required={false}
                        errors={props.errors?.facebookUrl?.errors}
                    >
                        <StringInput
                            inputMode="url"
                            value={props.value.facebookUrl}
                            onValueChange={url => {
                                onAction({ type: "facebook-url", value: url })
                            }}
                            disabled={props.disabled}
                        />
                    </Field>
                </>
            )}
        </>
    )
}
