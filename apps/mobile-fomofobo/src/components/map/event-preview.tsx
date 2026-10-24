import { localTimeOf } from "domain/local-format"
import { occurrenceProgress } from "domain/occurrence-progress"
import { occurrenceStatus } from "domain/occurrence-status"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { router } from "expo-router"
import type { Category, OccurrenceSummary, PublicVenue } from "models"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Linking, Pressable, View } from "react-native"
import { isDefined } from "shared/values"

import { SaveToggle } from "@/components/saves/save-toggle"
import { Badge } from "@/components/ui/badge/badge"
import { BottomSheetPanel } from "@/components/ui/bottom-sheet-panel/bottom-sheet-panel"
import { Button } from "@/components/ui/button/button"
import { DitheredPhoto } from "@/components/ui/dithered-photo/dithered-photo"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Notice } from "@/components/ui/notice/notice"
import { PixelCircle } from "@/components/ui/pixel-circle/pixel-circle"
import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { Text } from "@/components/ui/text/text"
import { TickProgress } from "@/components/ui/tick-progress/tick-progress"
import { usePriceSummary } from "@/lib/hooks/use-price-summary"

const OPEN_ICON_SIZE = 20

interface PreviewPaging {
    index: number
    total: number
    onPrevious: () => void
    onNext: () => void
}

export type PreviewVenue = Pick<
    PublicVenue,
    "id" | "name" | "address" | "coverPhotoUrl" | "kind" | "programmeUrl"
>

export type PreviewEntry =
    | { type: "occurrence"; occurrence: OccurrenceSummary }
    | { type: "venue"; venue: PreviewVenue }

interface PagingControlsProps {
    paging: PreviewPaging
}

const PagingControls = (props: PagingControlsProps) => {
    const { t } = useTranslation("shared")

    return (
        <View className="flex-row items-center justify-center gap-2">
            <IconButton
                icon="back"
                size="sm"
                label={t("Preview.Previous")}
                disabled={props.paging.index === 0}
                onPress={() => {
                    props.paging.onPrevious()
                }}
            />
            <Text variant="pixel-sm">
                {t("Preview.Position", {
                    index: props.paging.index + 1,
                    total: props.paging.total,
                })}
            </Text>
            <IconButton
                icon="back"
                size="sm"
                mirrored={true}
                label={t("Preview.Next")}
                disabled={props.paging.index === props.paging.total - 1}
                onPress={() => {
                    props.paging.onNext()
                }}
            />
        </View>
    )
}

interface OpenLinkProps {
    label: string
    fill: "live" | "permanent"
    onPress: () => void
}

const OpenLink = (props: OpenLinkProps) => (
    <Pressable
        accessibilityRole="link"
        accessibilityLabel={props.label}
        onPress={props.onPress}
        className="ml-auto"
    >
        <PixelCircle size={48} fill={props.fill} shadow="sm">
            <PixelIcon name="arrow" size={OPEN_ICON_SIZE} centered={true} />
        </PixelCircle>
    </Pressable>
)

interface OccurrenceBodyProps {
    occurrence: OccurrenceSummary
    categories: ReadonlyMap<string, Category>
    now: Date
    paging: PreviewPaging | undefined
    closeButton: ReactNode
}

const OccurrenceBody = (props: OccurrenceBodyProps) => {
    const { t } = useTranslation("shared")
    const priceSummary = usePriceSummary()

    const occurrence = props.occurrence
    const span = {
        startsAt: new Date(occurrence.startsAt),
        endsAt: new Date(occurrence.endsAt),
    }
    const status = occurrenceStatus(span, props.now)
    const details = [
        ...occurrence.categoryIds.map(id => props.categories.get(id)?.name),
        priceSummary(occurrence.priceScheme),
        occurrence.interestedCount === null
            ? undefined
            : t("Detail.Interested", { count: occurrence.interestedCount }),
    ].filter(isDefined)

    return (
        <>
            <View className="flex-row items-center justify-between gap-2">
                <Badge tone={status} dot={true}>
                    {t(`Status.${status}`)}
                </Badge>
                <View className="flex-row items-center gap-2">
                    <SaveToggle occurrence={occurrence} size="sm" />
                    {props.closeButton}
                </View>
            </View>
            {props.paging !== undefined && <PagingControls paging={props.paging} />}
            <View className="flex-row gap-3 border-t-2 border-line pt-3">
                <DitheredPhoto
                    uri={occurrence.coverPhotoUrl}
                    className="h-24 w-24 rounded-sm"
                />
                <View className="min-w-0 flex-1 gap-1">
                    <Text variant="pixel-xl" accessibilityRole="header">
                        {occurrence.title}
                    </Text>
                    {occurrence.venue.isBlocked ? (
                        <Text variant="body-md" className="text-fg-muted">
                            {occurrence.venue.name}
                        </Text>
                    ) : (
                        <Text
                            variant="body-md"
                            accessibilityRole="link"
                            className="text-fg-muted underline"
                            onPress={() => {
                                router.push({
                                    pathname: "/venues/[venueId]",
                                    params: { venueId: occurrence.venue.id },
                                })
                            }}
                        >
                            {occurrence.venue.name}
                        </Text>
                    )}
                    <Text variant="pixel-sm">{details.join(" · ")}</Text>
                </View>
            </View>
            {status === "live" && (
                <TickProgress
                    label={t("Preview.Elapsed")}
                    value={occurrenceProgress(span, props.now) * 100}
                    min={0}
                    max={100}
                    tone="live"
                />
            )}
            <View className="flex-row items-center gap-2 border-t-2 border-line pt-3">
                <Text variant="pixel-xl">
                    {`${localTimeOf(span.startsAt, PLATFORM_TIME_ZONE)}→${localTimeOf(span.endsAt, PLATFORM_TIME_ZONE)}`}
                </Text>
                <OpenLink
                    label={t("Preview.Open")}
                    fill="live"
                    onPress={() => {
                        router.push({
                            pathname: "/events/[eventId]/[date]",
                            params: {
                                eventId: occurrence.eventId,
                                date: occurrence.date,
                            },
                        })
                    }}
                />
            </View>
        </>
    )
}

interface VenueBodyProps {
    venue: PreviewVenue
    paging: PreviewPaging | undefined
    closeButton: ReactNode
}

const VenueBody = (props: VenueBodyProps) => {
    const { t } = useTranslation("shared")
    const venue = props.venue
    const programmeUrl = venue.programmeUrl

    return (
        <>
            <View className="flex-row items-center justify-between gap-2">
                {venue.kind === "regular" ? (
                    <View />
                ) : (
                    <Badge tone="permanent">{t(`VenueKind.${venue.kind}`)}</Badge>
                )}
                {props.closeButton}
            </View>
            {props.paging !== undefined && <PagingControls paging={props.paging} />}
            <View className="flex-row gap-3 border-t-2 border-line pt-3">
                {venue.coverPhotoUrl !== null && (
                    <DitheredPhoto
                        uri={venue.coverPhotoUrl}
                        className="h-24 w-24 rounded-sm"
                    />
                )}
                <View className="min-w-0 flex-1 gap-1">
                    <Text variant="pixel-xl" accessibilityRole="header">
                        {venue.name}
                    </Text>
                    <Text variant="body-md" className="text-fg-muted">
                        {venue.address}
                    </Text>
                </View>
            </View>
            <View className="flex-row items-center gap-2 border-t-2 border-line pt-3">
                {programmeUrl !== null && (
                    <Button
                        variant="secondary"
                        className="bg-permanent"
                        accessibilityRole="link"
                        accessibilityLabel={t("Preview.Programme")}
                        onPress={() => {
                            void Linking.openURL(programmeUrl)
                        }}
                    >
                        <Text>{t("Preview.Programme")}</Text>
                    </Button>
                )}
                <OpenLink
                    label={t("Preview.OpenVenue")}
                    fill="permanent"
                    onPress={() => {
                        router.push({
                            pathname: "/venues/[venueId]",
                            params: { venueId: venue.id },
                        })
                    }}
                />
            </View>
        </>
    )
}

interface EventPreviewProps {
    open: boolean
    entry: PreviewEntry | undefined
    loadFailed: boolean
    categories: ReadonlyMap<string, Category>
    now: Date
    paging: PreviewPaging | undefined
    onClose: () => void
}

export const EventPreview = (props: EventPreviewProps) => {
    const { t } = useTranslation("shared")

    const closeButton = (
        <IconButton
            icon="close"
            size="sm"
            label={t("Preview.Close")}
            onPress={props.onClose}
        />
    )

    return (
        <BottomSheetPanel open={props.open} onClose={props.onClose}>
            {props.entry === undefined ? (
                <>
                    <View className="flex-row items-center justify-between gap-2">
                        <Text variant="pixel-md" accessibilityRole="header">
                            {t("Preview.Title")}
                        </Text>
                        {closeButton}
                    </View>
                    <Notice
                        tone={props.loadFailed ? "error" : "loading"}
                        lines={[
                            props.loadFailed
                                ? t("Preview.Unavailable")
                                : t("Preview.Loading"),
                        ]}
                    />
                </>
            ) : props.entry.type === "occurrence" ? (
                <OccurrenceBody
                    occurrence={props.entry.occurrence}
                    categories={props.categories}
                    now={props.now}
                    paging={props.paging}
                    closeButton={closeButton}
                />
            ) : (
                <VenueBody
                    venue={props.entry.venue}
                    paging={props.paging}
                    closeButton={closeButton}
                />
            )}
        </BottomSheetPanel>
    )
}
