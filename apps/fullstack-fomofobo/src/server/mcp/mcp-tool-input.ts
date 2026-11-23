import "server-only"
import { customErrorParamsSchema } from "models"
import type { Event, EventUpsert } from "models"
import type { z } from "zod"

import { appError } from "../errors"

/**
 * @description Returns the text of one validation issue: its path and its message
 * @param issue Issue of a failed parse
 */
const describeIssue = (issue: z.core.$ZodIssue): string => {
    const params = customErrorParamsSchema.safeParse(
        "params" in issue ? issue.params : undefined,
    )
    const message = params.success ? params.data.message : issue.message
    return issue.path.length === 0 ? message : `${issue.path.join(".")}: ${message}`
}

/**
 * @description Returns the value parsed by the schema
 * @template TSchema Schema that the service expects
 * @param schema Schema that the REST route validates the same body with
 * @param value Input that the model built
 * @throws When the value fails the schema, with every issue in the message
 */
export const parseToolInput = <TSchema extends z.ZodType>(
    schema: TSchema,
    value: unknown,
): z.output<TSchema> => {
    const result = schema.safeParse(value)
    if (!result.success) {
        throw appError(
            "InvalidRequest",
            result.error.issues.map(describeIssue).join("; "),
        )
    }
    return result.data
}

/**
 * @description Maps an event to the upsert that writes it back unchanged
 * @param event Event read
 */
export const toEventUpsert = (event: Event): EventUpsert => ({
    title: event.title,
    description: event.description,
    categoryIds: event.categoryIds,
    primaryCategoryId: event.primaryCategoryId,
    venueId: event.venue.id,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    recurrence: event.recurrence,
    photoKeys: event.photos
        .toSorted((left, right) => left.position - right.position)
        .map(photo => photo.key),
    externalLinks: event.externalLinks,
    priceScheme: event.priceScheme,
    capacity: event.capacity,
    organizerId: event.organizer.id,
})
