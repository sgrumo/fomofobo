import { z } from "@hono/zod-openapi"

import { localDateSchema } from "./lib/local-time"

export const activeDevicePlatformValues = ["ios", "android", "web"] as const
export const activeDevicePlatformSchema = z.enum(activeDevicePlatformValues)
export type ActiveDevicePlatform = z.infer<typeof activeDevicePlatformSchema>

export const activeDeviceCheckInSchema = z.object({
    deviceId: z.uuid(),
    platform: activeDevicePlatformSchema,
    appVersion: z.string().trim().min(1).max(32).nullable(),
})
export type ActiveDeviceCheckIn = z.infer<typeof activeDeviceCheckInSchema>

export const activeDeviceCountSchema = z.object({
    platform: activeDevicePlatformSchema,
    devices: z.int().min(0),
})
export type ActiveDeviceCount = z.infer<typeof activeDeviceCountSchema>

export const activeDeviceStatsSchema = z.object({
    today: z.array(activeDeviceCountSchema),
    last7Days: z.array(activeDeviceCountSchema),
    last30Days: z.array(activeDeviceCountSchema),
    daily: z.array(activeDeviceCountSchema.extend({ date: localDateSchema })),
})
export type ActiveDeviceStats = z.infer<typeof activeDeviceStatsSchema>
