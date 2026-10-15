# Cloudflare deploy target

`README.md` holds the setup of an environment. The rules below apply to every change of the Worker configuration.

- Wrangler does not inherit `vars` or bindings into an `env` block. A new variable or binding goes into the top level and into every block under `env` of `apps/fullstack-fomofobo/wrangler.jsonc`.
- A new variable that the app reads also joins `WORKER_VARIABLES` in `e2e/fullstack-fomofobo/server.ts`. Wrangler passes no process variable to the local Worker of the E2E suite.
- A credential never goes into `wrangler.jsonc`. Store it with `wrangler secret put`, and list it in the "Runtime values" table of `README.md`.
- Deploy from CI alone. A local build reads `.dev.vars` and the `.env` files of the app into the bundle.
- The workflow applies the D1 migrations before the upload. A migration that the running code cannot read yet needs two deploys: first the code that reads both shapes, then the migration.
