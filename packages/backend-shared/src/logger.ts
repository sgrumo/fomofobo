export type LogLevel = "debug" | "info" | "warn" | "error"
export type LogMeta = Record<string, unknown>

const LEVEL_RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }

/**
 * @remarks Reads `NODE_ENV` at import time, so a later change has no effect
 */
const MIN_LEVEL: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug"

/**
 * @description Writes one JSON line through the console method of the level
 * @param level Severity of the entry
 * @param message Event name
 * @param meta Fields merged into the entry
 */
const log = (level: LogLevel, message: string, meta: LogMeta = {}): void => {
    if (LEVEL_RANK[level] >= LEVEL_RANK[MIN_LEVEL]) {
        console[level](JSON.stringify({ level, message, ...meta }))
    }
}

export const logger = {
    log,
    debug: (message: string, meta?: LogMeta): void => {
        log("debug", message, meta)
    },
    info: (message: string, meta?: LogMeta): void => {
        log("info", message, meta)
    },
    warn: (message: string, meta?: LogMeta): void => {
        log("warn", message, meta)
    },
    error: (message: string, meta?: LogMeta): void => {
        log("error", message, meta)
    },
}
