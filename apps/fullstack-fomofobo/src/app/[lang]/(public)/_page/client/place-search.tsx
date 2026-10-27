"use client"

import { useQuery } from "@tanstack/react-query"
import {
    isEmptySuggestions,
    MIN_SUGGESTION_TEXT,
    SUGGESTION_DELAY_MS,
    venueSuggestionGroupsOf,
} from "domain/map-search"
import { identity } from "es-toolkit"
import type { GeoPoint, OccurrenceRef, PlaceSuggestion } from "models"
import { useRef, useState } from "react"
import type { FocusEvent, MouseEvent } from "react"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { useDebounced } from "react-shared"
import { Alert } from "ui-components/alert"
import { SearchField } from "ui-components/search-field"
import { Spinner } from "ui-components/spinner"

import { RouteLink } from "@/framework/routes/route-link/route-link"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { routes } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { useOnline } from "@/lib/hooks/use-online"

interface PlaceSearchProps extends RouteClientComponentProps<"root"> {
    center: GeoPoint
    initialText: string
    onPlaceSelect: (place: PlaceSuggestion) => void
    onEventSelect: (ref: OccurrenceRef) => void
    onTextSubmit: (text: string) => void
}

export const PlaceSearch = (props: PlaceSearchProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const online = useOnline()
    const [text, setText] = useState(props.initialText)
    const [open, setOpen] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const [debouncedText] = useDebounced(text.trim(), identity, SUGGESTION_DELAY_MS)

    const showsSuggestions = open && debouncedText.length >= MIN_SUGGESTION_TEXT
    const suggestions = useQuery({
        ...api.searchPlacesQuery({
            params: {},
            query: {
                q: debouncedText,
                lat: props.center.latitude,
                lng: props.center.longitude,
            },
        }),
        enabled: showsSuggestions,
    })

    const places = suggestions.data?.places ?? []
    const events = suggestions.data?.events ?? []
    const venueGroups = venueSuggestionGroupsOf(suggestions.data?.venues ?? [])
    const closeWhenFocusLeaves = (event: FocusEvent) => {
        if (
            !(event.relatedTarget instanceof Node) ||
            formRef.current?.contains(event.relatedTarget) !== true
        ) {
            setOpen(false)
        }
    }
    // Keeps the focus inside, so the blur never closes the list before the click.
    const keepFocus = (event: MouseEvent) => {
        event.preventDefault()
    }
    const itemClassName =
        "tp-body-md hover:bg-surface-muted focus-visible:bg-surface-muted w-full cursor-pointer rounded-sm px-2 py-1.5 text-left outline-none"

    return (
        <form
            ref={formRef}
            role="search"
            className="relative"
            onSubmit={event => {
                event.preventDefault()
                setOpen(false)
                props.onTextSubmit(text)
            }}
        >
            <SearchField
                label={t("Search.Label")}
                placeholder={t("Search.Placeholder")}
                value={text}
                onFocus={() => {
                    setOpen(true)
                }}
                onBlur={closeWhenFocusLeaves}
                onKeyDown={event => {
                    if (event.key === "Escape" && showsSuggestions) {
                        // The suggestions take the Escape, so the preview stays open
                        event.preventDefault()
                        setOpen(false)
                    }
                }}
                onValueChange={value => {
                    setText(value)
                    setOpen(true)
                    if (value === "") {
                        props.onTextSubmit(value)
                    }
                }}
            />
            {showsSuggestions ? (
                <div className="bg-surface text-fg border-line shadow-hard-md absolute inset-x-0 top-full z-10 mt-2 flex max-h-[60dvh] flex-col gap-3 overflow-auto rounded-md border-2 p-2">
                    {suggestions.isFetching ? (
                        <Spinner title={t("Search.Loading")} size="xs" />
                    ) : undefined}
                    {suggestions.isError ? (
                        <Alert
                            type="error"
                            text={
                                online
                                    ? t("Search.Unavailable")
                                    : t("Search.NeedsConnection")
                            }
                        />
                    ) : undefined}
                    {suggestions.isSuccess && isEmptySuggestions(suggestions.data) ? (
                        <p className="tp-body-md text-fg-muted px-2">
                            {t("Search.Empty")}
                        </p>
                    ) : undefined}
                    {places.length > 0 ? (
                        <section
                            aria-label={t("Search.Places")}
                            className="flex flex-col"
                        >
                            <h2 className="tp-pixel-sm text-fg-muted px-2 uppercase">
                                {t("Search.Places")}
                            </h2>
                            {places.map(place => (
                                <button
                                    key={`${place.label}:${String(place.coordinates.latitude)}:${String(place.coordinates.longitude)}`}
                                    type="button"
                                    className={itemClassName}
                                    onBlur={closeWhenFocusLeaves}
                                    onMouseDown={keepFocus}
                                    onClick={() => {
                                        setText(place.label)
                                        setOpen(false)
                                        props.onPlaceSelect(place)
                                    }}
                                >
                                    {place.label}
                                </button>
                            ))}
                        </section>
                    ) : undefined}
                    {events.length > 0 ? (
                        <section
                            aria-label={t("Search.Events")}
                            className="flex flex-col"
                        >
                            <h2 className="tp-pixel-sm text-fg-muted px-2 uppercase">
                                {t("Search.Events")}
                            </h2>
                            {events.map(event => (
                                <button
                                    key={`${event.eventId}:${event.date}`}
                                    type="button"
                                    className={itemClassName}
                                    onBlur={closeWhenFocusLeaves}
                                    onMouseDown={keepFocus}
                                    onClick={() => {
                                        setOpen(false)
                                        props.onEventSelect({
                                            eventId: event.eventId,
                                            date: event.date,
                                        })
                                    }}
                                >
                                    {event.title}
                                </button>
                            ))}
                        </section>
                    ) : undefined}
                    {[
                        { label: t("Search.Venues"), venues: venueGroups.regular },
                        {
                            label: t("Search.PermanentVenues"),
                            venues: venueGroups.permanent,
                        },
                    ].map(group =>
                        group.venues.length === 0 ? undefined : (
                            <section
                                key={group.label}
                                aria-label={group.label}
                                className="flex flex-col"
                            >
                                <h2 className="tp-pixel-sm text-fg-muted px-2 uppercase">
                                    {group.label}
                                </h2>
                                {group.venues.map(venue => (
                                    <RouteLink
                                        key={venue.venueId}
                                        route={routes.venueDetail}
                                        parameters={{
                                            lang: language,
                                            venueId: venue.venueId,
                                        }}
                                        query={{}}
                                        className={itemClassName}
                                        onBlur={closeWhenFocusLeaves}
                                        onMouseDown={keepFocus}
                                    >
                                        {venue.name}
                                        <span className="tp-body-sm text-fg-muted block">
                                            {venue.address}
                                        </span>
                                    </RouteLink>
                                ))}
                            </section>
                        ),
                    )}
                    {places.length > 0 ? (
                        <a
                            href="https://www.geoapify.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="tp-body-sm text-fg-muted self-end px-2 underline"
                        >
                            {t("Search.PoweredBy")}
                        </a>
                    ) : undefined}
                </div>
            ) : undefined}
        </form>
    )
}
