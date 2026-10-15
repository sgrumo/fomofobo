const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB"]

/**
 * @description Returns the byte count as a string with its unit suffix
 * @param bytes Size measured
 * @remarks Caps the unit at `GB`
 */
export const formatFileSize = (bytes: number): string => {
    const exponent =
        bytes === 0 ? 0 : Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3)
    const value = bytes / 1024 ** exponent
    const rounded = exponent === 0 ? value : Math.round(value * 10) / 10
    return `${rounded} ${FILE_SIZE_UNITS[exponent]}`
}
