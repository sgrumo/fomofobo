import { pipe } from "es-toolkit/fp"
import { Result } from "shared/result"

/**
 * @description Returns a random UUID v4 string
 * @remarks Falls back to a manual generator when `crypto.randomUUID` throws
 */
export const uid = (): string =>
    pipe(
        Result.try(() => crypto.randomUUID()),
        Result.unwrapOrFrom(() =>
            "10000000-1000-4000-8000-100000000000".replaceAll(/[018]/gu, digit => {
                const random = crypto.getRandomValues(new Uint8Array(1))[0] ?? 0
                return (Number(digit) ^ (random & (15 >> (Number(digit) / 4)))).toString(
                    16,
                )
            }),
        ),
    )
