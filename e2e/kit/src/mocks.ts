import { faker } from "@faker-js/faker"
import { isoDate } from "shared/temporal"

/**
 * @description Returns a random future date as a `yyyy-MM-dd` string
 */
export const mockFutureIsoDate = (): string => isoDate(faker.date.future())
