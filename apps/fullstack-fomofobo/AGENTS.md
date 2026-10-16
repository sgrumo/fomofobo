See root `CLAUDE.md` for shared rules (types, patterns, shell, file structure).

Fullstack app: one Next.js process serves the API and the pages. The API mounts `backend-shared`, so every convention in `packages/backend-shared/CLAUDE.md` applies here. Before you write a router or a service under `src/server/`, invoke `/api-patterns`. The frontend has its own structure, described below.

## Next.js

- The installed version differs from training data. Read `node_modules/next/dist/docs/` before you write App Router code
- **NEVER** add `proxy.ts` (ex `middleware.ts`) - it runs before every matched request and spends the monthly Active CPU of the Hobby plan. Redirects go in `next.config.ts`, and each protected page calls `requireSession`
- **NEVER** enable `cacheComponents` / `"use cache"` - it forbids the `dynamic` segment config app-wide
- Use the generated route types: `PageProps<'/route'>`, `LayoutProps`. `pnpm typecheck` runs `next typegen` first
- Dev-only pages gate on `APP_ENV` through `devPagesEnabled()` + `notFound()`, **NEVER** on `NODE_ENV` - the E2E suite runs a production build with `APP_ENV=test`
- The root layout mounts `HydrationMarker`, which sets `data-hydrated` on `<html>` once React hydrates. The E2E suite waits for it before it acts - keep it in the root layout

## Structure

```
.
├── src/app/
│   ├── [lang]/                      # Root layout. The language is the first URL segment
│   │   ├── (protected)/             # Pages behind `requireSession`
│   │   ├── (public)/                # Open pages
│   │   └── [...rest]/               # Catch-all -> `notFound()`
│   ├── auth/logout/route.ts         # Sign-out, same-origin `POST` alone
│   └── api/[[...route]]/route.ts    # Hono mount, one export per HTTP verb
├── src/server/                      # The API: api.ts (DI), container.ts, auth/, config/, errors.ts, routers/, services/
├── src/actions/                     # "use server" boundary: `apiAction` alone
├── src/framework/routes/            # Route ledger, server pair, keyed hooks, RouteLink
├── src/lib/api/                     # Transports and the two api bindings
├── src/lib/query/                   # Server query client and prefetch
├── src/lib/i18n/                    # Instance, redirects, server translation + resources
└── src/components/
    ├── client/<name>/<name>.tsx     # Shared client components. Each opens with "use client"
    └── server/<name>/<name>.tsx     # Shared Server Components. Each opens with `import "server-only"`
```

### Components

- Page components: `_page/` beside `page.tsx`, with `client/`, `server/`, or both. No component -> no `_page`. No other `.tsx` in `src/app`
- `_page/server`: Server Components. Chrome, links, per-request reads. The frame renders the islands of its page
- `_page/client`: interactive islands. Query, mutation, local state, handlers. Flat files
- Server Component: receives `language` as a prop from its page, then `getTranslation` / `getNamespacedTranslation`. No `ui-components`, no hook
- `_page/client` props: `RouteClientComponentProps<"<key>">`, the ledger key of the page. A nested component receives `route={props.route}`
- Shared components (more than one page, or a layout): `src/components/<client|server>/<name>/<name>.tsx`, helpers such as `<name>.state.ts` beside it. A form or a dialog is shared
- Convention files (`layout`, `error`, `not-found`, ...) have no ledger key. Their components go to `src/components`

## Rendering

- The build has no database. A page that reads it **MUST** declare `export const dynamic = "force-dynamic"`
- No data -> static, no segment config. Per-user or fresh data -> `force-dynamic`, no cache
- Shared data a write marks stale -> `force-dynamic` + `unstable_cache(fn, keyParts, { tags })` **inside the service**. The writer calls `revalidateTag(tag, "max")`, plus `updateTag(tag)` when it reads its own write
- Every value that changes the result goes in `keyParts`. **NEVER** cache a per-user read under a shared key
- The Vercel Data Cache keeps an `unstable_cache` result across instances until its tag is revalidated. A cached read spends no Active CPU and no Turso row read

## Client boundary

- `ui-components` ships no `"use client"`. Every `.tsx` under `src/components/client` and `_page/client` opens with it
- A Server Component **NEVER** imports `ui-components`. It composes, reads `params`/`searchParams`, prefetches. Client components render
- `RouteLink` carries no `"use client"`: no hook, no boundary, both sides render it. The route hooks carry it: they call client hooks. A `route` object **NEVER** crosses a client boundary - it holds functions. A client component receives the key
- A folder named `server` holds server modules, Server Components included. Each opens with `import "server-only"` (lint: `custom/require-server-only`), so a client bundle that includes one fails the build
- A client component **NEVER** imports a server module (lint: `eslint/no-restricted-imports`, every path holding `server/`). Type imports allowed
- **Every export of a `"use server"` file is a public `POST` endpoint.** No credential, no caller-named upstream in such a file

## Data flow

```
Server Component  -> prefetchQueries -> serverApi  -> serverTransport -> Hono (in process)
Client component  -> useQuery        -> api        -> clientTransport -> fetch /api/*
Client component  -> useMutation     -> api        -> apiAction       -> serverTransport
```

- Server Actions serve **mutations only**. They run serially, so a query goes over same-origin HTTP
- `browserTransport` picks by method: `get` -> `clientTransport`, every other method -> `apiAction`
- `apiAction` wraps the transport, never one endpoint. **NEVER** write a per-endpoint action - `api-client` owns endpoints, cache keys, invalidation
- `browserTransport` sends the browser to the login page on a `401`, with no retry: a database session has no refresh

## Pages

- `const route = routes.<name>` once, top level, after the imports. No other `routes.<key>` in the file - links go through `RouteLink` in a component
- Static route page: `export const generateStaticParams = route.generateStaticParams`, no `dynamic` config. Dynamic route page: `force-dynamic`, no `generateStaticParams`. No `layout.tsx` names `generateStaticParams`
- `generateMetadata` reads `title` from `getDynamicRoute` / `getStaticRoute`. The root layout holds the `title.template` of the site. **NEVER** render `<title>` in a page
- Protected page: under `(protected)/`, opens with `await requireSession(path)`, `path` from `getDynamicRoute`
- Prefetch with `prefetchQueries` + `Promise.allSettled`, wrap the client view in one `HydrationBoundary`
- Pass `query` from `getDynamicRoute` (server) and `useDynamicRoute` (browser) to the prefetch and to `useQuery`. Both decode through `decodeRouteQuery`, so the cache keys match
- A filter, a page number, or a sort is a query key of the route, never `useState`
- `setQuery` writes the URL with `window.history`. No Server Component runs again. `useQuery` fetches the change, and `generateMetadata` keeps the title of the first load
- No interaction -> no `_page/client`. The root page renders `RootNavigation`, a Server Component, alone

## Routes

`src/framework/routes/routes.ts` is the route ledger. Next owns the routing: the ledger describes a `page.tsx`, never replaces one.

- Two variants by `type`. `createStaticRoute`: prerendered, empty query schema, holds `generateStaticParams` with complete parameters, `lang` included. `createDynamicRoute`: per request, holds `querySchema`
- Every route holds `segments`, a `title` builder, `parametersSchema`, `querySchema`. `segments` uses the Next bracket grammar: `["[lang]", "todos", "[id]"]`
- **Every** route opens with `"[lang]"` and holds `lang: languageKeySchema`. `getStaticRoute` / `getDynamicRoute` accept no route without it. Route groups such as `(protected)` stay out of the ledger
- Parameters schema: `[id]` -> `z.string()`, `[...slug]` -> `z.array(z.string())`, `[[...slug]]` -> that array `.optional()`. No check, no `.catch()` - validate in the page
- Query schema: every key has `.catch()`, the empty object decodes, the default query encodes, every key survives kebab case
- `title` receives `t` and `parameters`, never the query
- `route.path({ parameters, query })` builds every href. **NEVER** write a path string by hand
- A link passes `parameters={{ lang: language }}`: `useLanguage()` in a client component, `parameters.lang` of `getStaticRoute` / `getDynamicRoute` in a Server Component. A handler with no page passes `defaultLanguage`
- Server: `getStaticRoute(route, props)` / `getDynamicRoute(route, props)`, route object of `const route`
- Browser: `useStaticRoute(routes[props.route])` / `useDynamicRoute(routes[props.route])`. The prop is the literal key, so the index yields the exact route and the exact `parameters` / `query` types
- Route hooks: `_page/client` alone, argument `routes[props.route]` alone (lint: `eslint/no-restricted-imports`, test: `structure.test.ts`). A shared component has no route of its own
- `RouteLink`, `parseRouteParameters`, `decodeRouteQuery`: both variants, route object
- `routeHandlers` in the same file lists every `route.ts`, with `path` alone
- `routes.test.ts` walks `src/app` and enforces every rule above. The `*.test.ts` files beside the helpers and hooks hold `expectTypeOf` / `@ts-expect-error` assertions - `tsc` runs them, not vitest

## Authentication

OpenID Connect Authorization Code with PKCE, owned by `openid-client`. No hand-written cryptography or token parsing.

```
(protected)/<page>   -> requireSession(path) -> redirect to /auth/login?returnTo= when absent
(protected)/layout   -> getSession()         -> avatar menu with sign-out
/auth/login          -> PKCE + state cookie  -> provider
/auth/callback       -> code exchange        -> session cookies -> returnTo
/auth/refresh        -> refresh grant        -> new cookies, 401 keeps the old ones
/auth/logout         -> POST, same origin    -> 303 to the end-session endpoint
```

- **Every `(protected)` page calls `requireSession` with its own path** - never the layout (no pathname there), never `proxy.ts`
- The guard gates pages. The security boundary is the Hono middleware of `backend-shared/auth`, which verifies the token of **every** API call
- `getSession()` reads claims **without** a signature check. Display and expiry only. **NEVER** decide access with it
- A route handler sets cookies on the response it returns (`NextResponse.cookies.set`). `redirect()` of `next/navigation` drops the `cookies()` store
- Cookies are `HttpOnly`, the browser never holds a token. The middleware reads the access cookie on a same-origin `GET`, the `Authorization` header in process
- Cookie names and `Secure` follow `APP_ENV`: `__Host-` + `Secure` in `preview` and `vercel`, plain in `local` and `test`. A deletion repeats path and flag
- Provider unreachable -> `503` (`AuthProviderUnavailable`), **NEVER** `401` - a `401` signs everybody out
- `/auth/refresh` keeps the cookies on a refused grant - two tabs share one token
- `/auth/logout` answers a same-origin `POST` alone and redirects with `303` - a `307` replays the `POST` at the provider
- `preview` and `vercel` refuse a plain-HTTP issuer. `local` and `test` opt in through `allowInsecureOidc`
- Provider extras (password policies, admin SDKs, post-login hooks) stay out of this app

## API

- Route definitions in `packages/api-routes` already carry `/api`. Hono declares **no** base path
- Only `/api/health`, `/api/doc`, `/api/swagger` and `/api/test/reset-database` repeat the prefix by hand. Doc and Swagger answer outside production alone. The reset answers under `APP_ENV=test` alone, for the E2E suite
- The route handler builds the application on the first request, never at module evaluation

## Environment

- `APP_ENV` drives error verbosity, API docs, the dev pages and the cookie flags. No default on Vercel (`VERCEL=1`): each environment of the project sets it. Elsewhere an unset value reads as `local`
- `src/server/config/env.ts`: one block per shape, every field in every block. Read the remarks there before you add a variable

## i18n

- `react-i18next`. **NOT** `next-intl` - its locale negotiation needs middleware
- `src/app/[lang]/layout.tsx` parses `lang` with `languageKeySchema`, calls `notFound()` for an unknown value, sets `<html lang>`. No `generateStaticParams` there
- A URL with no language, or an unsupported one, redirects to the default through `redirects` in `next.config.ts`, built by `src/lib/i18n/language-redirects.ts`. No `Accept-Language` detection
- The server reads the language from the parsed `lang` parameter of `getStaticRoute` / `getDynamicRoute`. The page passes it to its frame as a prop. A route handler passes `defaultLanguage`
- Locale files are imported in one server-only module, `src/lib/i18n/server/resources.ts`. The root layout passes the resources of the URL language to `I18nProvider` as a prop. No fetch, no detector
- One instance from context: `useTranslation()` in components, its `i18n` for `parseFormState`. **NEVER** build a second instance in a component. Server titles go through `getTranslation`
- The language switcher is a row of links to the current pathname with the first segment replaced (`replaceLanguage`), inside a `Suspense` because `useSearchParams` suspends a prerendered page
- Translations: `public/locales/${locale}/${namespace}.json`. `instance.ts` lists the namespaces by hand, the locale test checks the list
- `[lang]/[...rest]/page.tsx` catches every unmatched path -> `notFound()` -> `[lang]/not-found.tsx` in the URL language, status `404`

## Deployment

`infra/auth-oidc.md` documents the provider setup, and `infra/vercel/README.md` the deploy. Read them **before** you change env vars, secrets, the database, object storage or networking. **NEVER** assume a topology.
