/**
 * @description Returns the value unchanged after passing it to a sink
 * @template T Value type
 * @param value Value passed through
 * @param fn Sink receiving the value
 */
export const debugIdentity = <T>(value: T, fn: (value: T) => void = console.debug): T => {
    fn(value)
    return value
}
