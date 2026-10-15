# E2E kit

The harness that every suite imports. It holds no test. Each module is one entry of `exports` in `package.json`.

## Lifecycle

The global setup of each suite calls `defineLifecycle`. It starts Postgres, pushes the Drizzle schema, and truncates every table. Then the suite asks the stack for the rest: free ports, the object store, the OpenID provider, and its servers.

- The lifecycle writes the connection variables into `process.env`, so every server and test worker inherits them.
- An API suite lists `e2e-kit/vitest-reset` in `setupFiles`. It truncates every table before each test.
- If a suite keeps state outside Postgres, such as objects in a bucket or an in-memory fake, add a setup file with a `beforeEach` that clears it. List it in `setupFiles` after `e2e-kit/vitest-reset`.
- The truncate connects only through the connection string that the lifecycle publishes for its container, never through the `PG*` variables of the shell. Without a lifecycle it throws, so it cannot wipe a developer database.
- The teardown stops each server with `SIGTERM`, then `SIGKILL` after five seconds.
- Every port is dynamic. The containers use mapped ports, and each server listens on a port from `stack.freePort()`. The ports of two suites therefore never collide.

## Rules

- Put code here only when two or more suites use it. The behavior of one app stays in its suite.
- Start every server through `stack.startServer`, never with a bare `spawn`. The teardown then stops it.
- A server spawned through `pnpm` gets `SIGTERM` first. pnpm relays `SIGTERM` to the script, but a `SIGKILL` stops pnpm alone and leaves the script alive.
- If a test needs `if (...) throw` or an `as` cast to narrow a type, add a helper to `src/assertions.ts`. It uses an assertion signature, so the type narrows after the call, and `Error.captureStackTrace`, so the stack points at the call site.
- A vitest config must not import this package. Vitest loads its config under Node, which cannot resolve the extension-less imports of a workspace package.
