/**
 * @description Returns a distance in the narrow unit style of the language: meters rounded
 * to ten under a kilometer, kilometers with one decimal from there
 * @param meters Distance in meters
 * @param language BCP 47 language of the text
 */
export const formatDistance = (meters: number, language: string): string => {
    const roundedMeters = Math.round(meters / 10) * 10

    return roundedMeters < 1000
        ? new Intl.NumberFormat(language, {
              style: "unit",
              unit: "meter",
              unitDisplay: "narrow",
          }).format(roundedMeters)
        : new Intl.NumberFormat(language, {
              style: "unit",
              unit: "kilometer",
              unitDisplay: "narrow",
              maximumFractionDigits: 1,
          }).format(meters / 1000)
}
