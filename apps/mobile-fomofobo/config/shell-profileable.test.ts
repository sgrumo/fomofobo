import { describe, expect, it } from "vitest"

import { shellProfileableOf } from "./shell-profileable"

describe("shellProfileableOf", () => {
    it("opens the application to the profiler of the shell and keeps its other children", () => {
        const application = {
            $: { "android:name": ".MainApplication" },
            activity: [{ $: { "android:name": ".MainActivity" } }],
        }

        expect(shellProfileableOf(application)).toStrictEqual({
            ...application,
            profileable: [{ $: { "android:shell": "true" } }],
        })
    })
})
