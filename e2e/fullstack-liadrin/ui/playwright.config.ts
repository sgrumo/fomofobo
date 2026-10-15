import { definePlaywrightSuite } from "e2e-kit/playwright"

// `APP_ENV=test` serves the dev pages in the production build, so the UI samples run
// in CI too.
export default definePlaywrightSuite({
    dir: import.meta.dirname,
    runner: "ui",
})
