# E2E kit

The harness that every suite imports. It holds no test. Each module is one entry of `exports` in `package.json`.

## Lifecycle

The global setup of each suite calls `defineLifecycle`. The suite asks the stack for what it needs: free ports, the object store, the OpenID provider, and its servers. The database belongs to the app: the suite prepares its local D1 state and serves the app on it.

- The lifecycle writes the connection variables into `process.env`, so every server and test worker inherits them.
- An API suite lists `e2e-kit/vitest-reset` in `setupFiles`. Before each test it calls `POST /api/test/reset-database` on the published app URL, and the app deletes every row. Never write the SQLite file of a running workerd from the test process: it corrupts the state that workerd holds open.
- If a suite keeps state outside the database, such as objects in a bucket or an in-memory fake, add a setup file with a `beforeEach` that clears it. List it in `setupFiles` after `e2e-kit/vitest-reset`.
- Without a lifecycle, the reset throws. Only an app under `APP_ENV=test` serves the route. The reset therefore cannot wipe a developer database.
- The teardown stops each server with `SIGTERM`, then `SIGKILL` after five seconds.
- Every port is dynamic. The containers use mapped ports, and each server listens on a port from `stack.freePort()`. The ports of two suites therefore never collide.

## Rules

- Put code here only when two or more suites use it. The behavior of one app stays in its suite.
- Start every server through `stack.startServer`, never with a bare `spawn`. The teardown then stops it.
- A server spawned through `pnpm` gets `SIGTERM` first. pnpm relays `SIGTERM` to the script, but a `SIGKILL` stops pnpm alone and leaves the script alive.
- If a test needs `if (...) throw` or an `as` cast to narrow a type, add a helper to `src/assertions.ts`. It uses an assertion signature, so the type narrows after the call, and `Error.captureStackTrace`, so the stack points at the call site.
- A vitest config must not import this package. Vitest loads its config under Node, which cannot resolve the extension-less imports of a workspace package.
