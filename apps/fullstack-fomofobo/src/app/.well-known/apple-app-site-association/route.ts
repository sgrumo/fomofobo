import { appLinkDocuments } from "@/server/config/app-links"

/**
 * @description Answers the Apple App Site Association document of this origin, which iOS reads
 * before an iOS app opens a map link of the origin
 */
export const GET = (): Response => Response.json(appLinkDocuments().appSiteAssociation)
