import { stdin, stdout } from "node:process"
import { createInterface } from "node:readline/promises"
import { Writable } from "node:stream"

/**
 * @description Reads one line per prompt from the standard input, without echoing them
 * @param first Text printed before the first line
 * @param second Text printed before the second line
 * @throws When the input ends before the second line
 */
export const readHiddenPair = async (
    first: string,
    second: string,
): Promise<[string, string]> => {
    const silent = new Writable({
        write: (_chunk, _encoding, callback) => {
            callback()
        },
    })
    const rl = createInterface({ input: stdin, output: silent, terminal: stdin.isTTY })
    // Line iterator buffers a piped second line, which `rl.question` drops
    const lines = rl[Symbol.asyncIterator]()

    stdout.write(first)
    const firstLine = await lines.next()
    stdout.write(`\n${second}`)
    const secondLine = await lines.next()
    stdout.write("\n")
    rl.close()

    if (firstLine.done === true || secondLine.done === true) {
        throw new Error("The input ended before both passwords")
    }
    return [firstLine.value, secondLine.value]
}
