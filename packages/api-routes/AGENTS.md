# API routes package

Route definitions. One file per domain: `src/<domain>-routes.ts`. Each file exports one `XxxRoutes` object.

A file that is not a route definition goes in `src/lib/`. Route files stay flat beside it. The two names hold at every layout below.

A route definition is the one contract of an endpoint, and three consumers read it. The backend router binds a handler to it, and `respond` validates the answer against it. `api-client` builds the request, the cache key and the query options from it. The server generates the OpenAPI document from it.

`/api-patterns` holds the patterns of each API layer and the steps for a new endpoint.

## Stacks

A stack is the set of routes that one server app serves. One repository can hold several stacks: a public API, a backoffice, a webhook receiver.

This package starts flat, with one barrel in `src/index.ts`. The flat layout holds while one server app serves every route.

## When to split

Run this evaluation when you add a route to a repository that holds more than one server app:

1. List the server apps that mount routes from this package.
2. If one app mounts every route, keep the flat layout and stop.
3. If two or more apps mount different sets of routes, tell the user that the package needs the split.

Do not split the package inside another task. The split rewrites every import of the package, so it is a task of its own. The user decides when it runs.

## The split

Each stack gets a folder. Routes that two stacks serve go to `shared/`. `lib/` does not move:

```
src/
  lib/         files that are not route definitions
  shared/      routes that two stacks serve
  backoffice/
  storefront/
  webhooks/
```

The folder names the app that serves the route. The barrel of the folder is the set of the stack, so no file lists the routes of a stack by hand.

A domain that spans two stacks becomes two files, one per folder. This is correct. A catalog read for the storefront and an admin read for the backoffice are two contracts.

The folders, the barrels and the import rewrites are mechanical. Three points are easy to miss:

- A subpath export per stack names the stacks that exist. It never names the stack that one app can read. A restriction on the imports of each app does that.
- Delete the export of the package root last. The typecheck then fails on every import that does not name a stack.
- Delete every hand-written array of routes, and every test that asserts a route count. The barrel of a folder is the set.

## Rules

- Keep `shared/` small. If it holds a large share of the routes, the stacks are one stack. Merge them.
- A stack is a folder. It is not an OpenAPI tag, and a path prefix alone does not carry it. A typo in a tag passes the typecheck, and a cross-stack route has no prefix.
- `api-client` follows this package. When the routes split per stack, `createApi` and the cache keys split too.
