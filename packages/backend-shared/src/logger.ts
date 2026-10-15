import winston from "winston"

/**
 * @remarks Reads `NODE_ENV` at import time, so a later change has no effect
 */
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: winston.format.json(),
    transports: [
        process.env.NODE_ENV === "production"
            ? new winston.transports.Console({
                  format: winston.format.json(),
              })
            : new winston.transports.Console({
                  format: winston.format.combine(
                      winston.format.colorize(),
                      winston.format.simple(),
                  ),
              }),
    ],
})
