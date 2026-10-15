import { expect } from "vitest"
import { z } from "zod"

export const anyUuid: unknown = expect.schemaMatching(z.uuid())

export const anyIsoDateTime: unknown = expect.schemaMatching(z.iso.datetime())

export const anyHttpUrl: unknown = expect.schemaMatching(z.url({ protocol: /^https?$/u }))
