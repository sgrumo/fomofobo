import { stdin as input, stdout as output } from "node:process"
import { createInterface } from "node:readline/promises"

import { obfuscate } from "obfuscation/obfuscate"

/**
 * @description Reads one line from the standard input and prints its obfuscated form
 */
const main = async () => {
    const rl = createInterface({ input, output })
    const line = await rl.question("Enter the string to obfuscate: ")
    rl.close()

    console.log(obfuscate(line))
}

void main()
