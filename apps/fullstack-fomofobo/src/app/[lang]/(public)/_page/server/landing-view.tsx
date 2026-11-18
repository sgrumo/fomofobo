import "server-only"
import type { LanguageKey } from "i18n/i18n"

import type { StorePlatform } from "@/lib/app-stores/store-platform"
import { getTranslation } from "@/lib/i18n/server/translation"
import { CONTACT_EMAIL } from "@/lib/platform/platform"

import { ExploreCard } from "../client/explore-card"

const POINTS = [
    { key: "Live", dot: "bg-live landing-blink" },
    { key: "NoFeed", dot: "bg-upcoming" },
    { key: "NoLogin", dot: "bg-permanent" },
    { key: "Privacy", dot: "bg-social" },
] as const

// The landing is prerendered, so the year is the one of the build
const BUILD_YEAR = new Date().getFullYear()

interface LandingViewProps {
    language: LanguageKey
    storeUrls: Record<StorePlatform, string | undefined>
}

export const LandingView = (props: LandingViewProps) => {
    const t = getTranslation(props.language)

    return (
        <div className="landing">
            <div className="landing-main">
                <div className="landing-logo" aria-hidden="true" />
                <h1 className="landing-mono landing-wordmark">{t("Landing.Wordmark")}</h1>
                <p className="landing-tagline">
                    {t("Landing.Tagline")} <br className="landing-tagline-break" />
                    {t("Landing.TaglineMore")}
                </p>
                <div className="landing-explore">
                    <ExploreCard route="root" storeUrls={props.storeUrls} />
                </div>
                <section
                    className="landing-points-frame"
                    aria-label={t("Landing.PointsLabel")}
                >
                    <div className="landing-step bg-surface-inverse p-0.5">
                        <ul className="landing-step landing-points">
                            {POINTS.map(point => (
                                <li key={point.key}>
                                    <span className="landing-mono landing-point-tag">
                                        <span className={`landing-dot ${point.dot}`} />
                                        {t(`Landing.Points.${point.key}.Tag`)}
                                    </span>
                                    <span className="landing-mono landing-point-title">
                                        {t(`Landing.Points.${point.key}.Title`)}
                                    </span>
                                    <span className="landing-point-body">
                                        {t(`Landing.Points.${point.key}.Body`)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>
            <footer className="landing-mono landing-footer">
                <span>{t("Landing.Copyright", { year: BUILD_YEAR })}</span>
                <a href={`mailto:${CONTACT_EMAIL}`}>{t("Landing.Contact")}</a>
            </footer>
        </div>
    )
}
