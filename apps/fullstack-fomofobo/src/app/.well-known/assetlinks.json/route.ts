import { appLinkDocuments } from "@/server/config/app-links"

/**
 * @description Answers the Digital Asset Links statements of this origin, which Android reads
 * before an Android app opens a map link of the origin
 */
export const GET = (): Response => Response.json(appLinkDocuments().assetLinks)
