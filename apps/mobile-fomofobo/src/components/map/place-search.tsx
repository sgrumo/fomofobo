import { useQuery } from "@tanstack/react-query"
import {
    isEmptySuggestions,
    MIN_SUGGESTION_TEXT,
    SUGGESTION_DELAY_MS,
    venueSuggestionGroupsOf,
} from "domain/map-search"
import { identity } from "es-toolkit"
import { router } from "expo-router"
import { HttpStatus } from "models"
import type { GeoPoint, OccurrenceRef, PlaceSuggestion } from "models"
import { useState } from "react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Keyboard, Linking, Pressable, ScrollView, View } from "react-native"
import { useDebounced } from "react-shared"

import { Notice } from "@/components/ui/notice/notice"
import { PixelPanel } from "@/components/ui/pixel-panel/pixel-panel"
import { SearchField } from "@/components/ui/search-field/search-field"
import { Spinner } from "@/components/ui/spinner/spinner"
import { Text } from "@/components/ui/text/text"
import { ApiResponseError } from "@/lib/api/api-response-error"
import { api } from "@/lib/api/client"
import { useOnline } from "@/lib/hooks/use-online"
import { cn } from "@/lib/utils/class-names"

const GEOAPIFY_URL = "https://www.geoapify.com/"

interface SuggestionRowProps {
    label: string
    detail?: string
    onPress: () => void
}

const SuggestionRow = (props: SuggestionRowProps) => {
    const [pressed, setPressed] = useState(false)

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={
                props.detail === undefined
                    ? props.label
                    : `${props.label}, ${props.detail}`
            }
            onPress={props.onPress}
            onPressIn={() => {
                setPressed(true)
            }}
            onPressOut={() => {
                setPressed(false)
            }}
            className={cn(
                "min-h-11 justify-center rounded-sm px-2 py-1.5",
                pressed && "bg-surface-muted",
            )}
        >
            <Text variant="body-md">{props.label}</Text>
            {props.detail !== undefined && (
                <Text variant="body-sm" className="text-fg-muted">
                    {props.detail}
                </Text>
            )}
        </Pressable>
    )
}

interface SuggestionSectionProps {
    label: string
    children?: ReactNode
}

const SuggestionSection = (props: SuggestionSectionProps) => (
    <View>
        <Text
            variant="pixel-sm"
            accessibilityRole="header"
            className="px-2 uppercase text-fg-muted"
        >
            {props.label}
        </Text>
        {props.children}
    </View>
)

interface PlaceSearchProps {
    center: GeoPoint
    initialText: string
    onPlaceSelect: (place: PlaceSuggestion) => void
    onEventSelect: (ref: OccurrenceRef) => void
    onTextSubmit: (text: string) => void
}

export const PlaceSearch = (props: PlaceSearchProps) => {
    const { t } = useTranslation("shared")
    const online = useOnline()
    const [text, setText] = useState(props.initialText)
    const [open, setOpen] = useState(false)
    const [debouncedText] = useDebounced(text.trim(), identity, SUGGESTION_DELAY_MS)

    const showsSuggestions = open && debouncedText.length >= MIN_SUGGESTION_TEXT
    const {
        data: suggestions,
        error: suggestionsError,
        isFetching: suggestionsFetching,
        isSuccess: suggestionsLoaded,
    } = useQuery({
        ...api.searchPlacesQuery({
            params: {},
            query: {
                q: debouncedText,
                lat: props.center.latitude,
                lng: props.center.longitude,
            },
        }),
        enabled: showsSuggestions && online,
        // The route allows 30 calls a minute per IP: a retry spends the budget of every phone behind it
        retry: false,
    })

    const places = suggestions?.places ?? []
    const events = suggestions?.events ?? []
    const venueGroups = venueSuggestionGroupsOf(suggestions?.venues ?? [])
    const errorText = online
        ? suggestionsError instanceof ApiResponseError &&
          suggestionsError.status === HttpStatus.TooManyRequests
            ? t("Search.TooMany")
            : t("Search.Unavailable")
        : t("Search.NeedsConnection")

    const close = () => {
        setOpen(false)
        Keyboard.dismiss()
    }

    return (
        <View className="gap-2">
            <SearchField
                label={t("Search.Label")}
                placeholder={t("Search.Placeholder")}
                value={text}
                onFocus={() => {
                    setOpen(true)
                }}
                onBlur={() => {
                    setOpen(false)
                }}
                onValueChange={value => {
                    setText(value)
                    setOpen(true)
                    if (value === "") {
                        props.onTextSubmit(value)
                    }
                }}
                onSubmitEditing={() => {
                    setOpen(false)
                    props.onTextSubmit(text)
                }}
            />
            {showsSuggestions && (
                <PixelPanel shadow="md">
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        className="max-h-80"
                        contentContainerClassName="gap-3 p-2"
                    >
                        {suggestionsFetching && (
                            <Spinner label={t("Search.Loading")} size="sm" />
                        )}
                        {(suggestionsError !== null || !online) && (
                            <Notice
                                tone={online ? "error" : "info"}
                                lines={[errorText]}
                            />
                        )}
                        {suggestionsLoaded && isEmptySuggestions(suggestions) && (
                            <Text variant="body-md" className="px-2 text-fg-muted">
                                {t("Search.Empty")}
                            </Text>
                        )}
                        {places.length > 0 && (
                            <SuggestionSection label={t("Search.Places")}>
                                {places.map(place => (
                                    <SuggestionRow
                                        key={`${place.label}:${String(place.coordinates.latitude)}:${String(place.coordinates.longitude)}`}
                                        label={place.label}
                                        onPress={() => {
                                            setText(place.label)
                                            close()
                                            props.onPlaceSelect(place)
                                        }}
                                    />
                                ))}
                            </SuggestionSection>
                        )}
                        {events.length > 0 && (
                            <SuggestionSection label={t("Search.Events")}>
                                {events.map(event => (
                                    <SuggestionRow
                                        key={`${event.eventId}:${event.date}`}
                                        label={event.title}
                                        onPress={() => {
                                            close()
                                            props.onEventSelect({
                                                eventId: event.eventId,
                                                date: event.date,
                                            })
                                        }}
                                    />
                                ))}
                            </SuggestionSection>
                        )}
                        {[
                            { label: t("Search.Venues"), venues: venueGroups.regular },
                            {
                                label: t("Search.PermanentVenues"),
                                venues: venueGroups.permanent,
                            },
                        ].map(
                            group =>
                                group.venues.length > 0 && (
                                    <SuggestionSection
                                        key={group.label}
                                        label={group.label}
                                    >
                                        {group.venues.map(venue => (
                                            <SuggestionRow
                                                key={venue.venueId}
                                                label={venue.name}
                                                detail={venue.address}
                                                onPress={() => {
                                                    close()
                                                    router.push({
                                                        pathname: "/venues/[venueId]",
                                                        params: {
                                                            venueId: venue.venueId,
                                                        },
                                                    })
                                                }}
                                            />
                                        ))}
                                    </SuggestionSection>
                                ),
                        )}
                        {places.length > 0 && (
                            <Text
                                variant="body-sm"
                                accessibilityRole="link"
                                className="self-end px-2 py-1 text-fg-muted underline"
                                onPress={() => {
                                    void Linking.openURL(GEOAPIFY_URL)
                                }}
                            >
                                {t("Search.PoweredBy")}
                            </Text>
                        )}
                    </ScrollView>
                </PixelPanel>
            )}
        </View>
    )
}
