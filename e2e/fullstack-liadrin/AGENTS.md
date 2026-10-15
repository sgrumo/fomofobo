# Fullstack app E2E suites

`api/` follows "API suites" and `ui/` follows "Browser suites" in `e2e/AGENTS.md`, both on top of "Every suite". The traps below apply on top.

The package holds two suites that share `server.ts` and `lifecycle.ts`. Each global setup builds the app, starts the standalone server that the deploy image runs, and starts its own OpenID provider.

| Suite  | Runner               | How a test reaches the app             |
| ------ | -------------------- | -------------------------------------- |
| `api/` | Vitest, over HTTP    | `publishedAppUrl()` from `e2e-kit/env` |
| `ui/`  | Playwright, Chromium | The `baseURL` of the test              |

`pnpm e2e` runs `api/` first, then `ui/`. `pnpm e2e:api` and `pnpm e2e:ui` run one suite.

## Traps

- `server.ts` copies `.next/static` and `public` into the standalone bundle, the same way as `infra/docker/Dockerfile`. If you change one copy, change the other.
- The server runs with `APP_ENV=test`, so the production build serves the dev pages and CI runs the UI samples.
- In `api/`, every call of `createApiCall` from `api/api.ts` carries the token of the suite, unless the case sets its own headers.
- `api/` cannot test a route with the `QUERY` method. The Next App Router answers `400` to it before Hono sees it.
- In `ui/`, open a page with `gotoPage(page, "/<path>/")` and reload it with `reloadPage(page)` from `ui/app.ts`, never with a bare `page.goto`. Both wait for React to hydrate the server HTML. Input before hydration reaches no handler and is lost.
- The language is the first URL segment, so `gotoPage` prefixes the E2E locale.
- `signIn(page)` drives the real login round trip through the mock provider.
- `t()` for the app strings comes from `ui/app.ts`.
