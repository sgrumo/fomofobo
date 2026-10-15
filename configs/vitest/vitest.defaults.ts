import type { InlineConfig } from "vitest/node"

import { outputOptions } from "./vitest.output-options.ts"

/**
 * @description Test options every suite shares: the reporter wiring, the console filter, the shared worker, and the clean state each test starts from
 * @remarks Drops every `vi.spyOn` spy before each test, so a spy installed in `beforeAll` is absent from the second test on
 */
export const testDefaults: InlineConfig = {
    silent: "passed-only",
    isolate: false,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    reporters: outputOptions.reporters,
    outputFile: outputOptions.outputFile,
}
