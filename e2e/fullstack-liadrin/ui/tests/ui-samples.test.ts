import { defineUiSamplesTests } from "e2e-ui-components/samples"

import { gotoPage } from "../app"

defineUiSamplesTests({
    openSamples: async page => {
        await gotoPage(page, "/dev/samples/")
    },
})
