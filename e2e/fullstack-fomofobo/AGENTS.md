# Fullstack app E2E suites

`api/` follows "API suites" and `ui/` follows "Browser suites" in `e2e/AGENTS.md`, both on top of "Every suite". The traps below apply on top.

The package holds two suites that share `server.ts` and `lifecycle.ts`. Each global setup starts its own object store and builds the production bundle of the app. It serves the bundle with `next start`, on a libSQL database file of its own under `.ignored/e2e-databases/`.

| Suite  | Runner               | How a test reaches the app             |
| ------ | -------------------- | -------------------------------------- |
| `api/` | Vitest, over HTTP    | `publishedAppUrl()` from `e2e-kit/env` |
| `ui/`  | Playwright, Chromium | The `baseURL` of the test              |

`pnpm e2e` runs `api/` first, then `ui/`. `pnpm e2e:api` and `pnpm e2e:ui` run one suite.

## Traps

- A variable that one runner needs of its own, such as `DATABASE_URL`, goes in the `env` of `appServer`.
- The server runs with `APP_ENV=test`, so the production build serves the dev pages and CI runs the UI samples.
- `api/` cannot test a route with the `QUERY` method. The Next App Router answers `400` to it before Hono sees it.
- In `ui/`, open a page with `gotoPage(page, "/<path>/")` and reload it with `reloadPage(page)` from `ui/app.ts`, never with a bare `page.goto`. Both wait for React to hydrate the server HTML. Input before hydration reaches no handler and is lost.
- The language is the first URL segment, so `gotoPage` prefixes the E2E locale.
- `t()` for the app strings comes from `ui/app.ts`.
