import { closingInfoOf } from "domain/venue-closing"
import type { VenueClosingDays } from "models"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"

/**
 * @description Returns a function that writes the closing days of a venue, such as "Chiuso
 * lunedì, martedì", undefined when nobody set them
 */
export const useClosingText = () => {
    const { t } = useTranslation("shared")

    return (closingDays: VenueClosingDays | null): string | undefined =>
        match(closingInfoOf(closingDays))
            .with({ type: "unknown" }, () => undefined)
            .with({ type: "always-open" }, () => t("Venue.AlwaysOpen"))
            .with({ type: "closed" }, closed =>
                t("Venue.ClosedOn", {
                    days: closed.days.map(day => t(`Weekday.${day}`)).join(", "),
                }),
            )
            .exhaustive()
}
