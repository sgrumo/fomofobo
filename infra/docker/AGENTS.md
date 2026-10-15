# Docker stack

## Fragments

- A new app adds a `compose.<app>.yaml` fragment and a `.caddy` file. It changes no existing file except the include list in `docker-compose.yaml`.
- The Caddy config reads `routes/` and `sites/` through two globs. An empty or absent directory is valid.
- A path inside a fragment resolves against `infra/docker/`, not against the directory that `docker compose` runs from.
- An `include` merge keeps the first value of a key that two files declare. So a fragment cannot override a value of another file. To add a CORS origin, a fragment sets `S3_CORS_EXTRA_ORIGIN`, never `S3_CORS_ALLOW_ORIGIN`.
- Each fragment sets the `json-file` log driver with rotation limits. Dozzle reads those files.

## Images

- pnpm runs only while an image builds, never in a container.
- The two one-shot images get one package with its dependencies from `pnpm deploy`, then call a binary of that package: `drizzle-kit` for `migrations`, `tsx` for `objectstore-init`.
- The `nextjs` target copies the `standalone` output as it is and starts the `server.js` that it generates. Never run `pnpm install` inside that image. The traced `node_modules` holds the workspace packages already, and an install breaks it.

## Object store init

- `objectstore-init` gates `api` the same way `migrations` does, so the API never writes control-plane state.
- Its code is `infra/objectstore-init/`. `pnpm infra:up:local` runs the same code on the host.
- It makes three calls, and each one is safe to repeat: create the bucket, delete any bucket policy, write the CORS rule.
- On AWS the CDK stack owns the bucket and the CORS rule. The Lambda role cannot create either.

## Env files

- `.env.template` names every credential and host value, grouped by the app that reads it. `infra/cdk/lib/docker-env-template.test.ts` compares it with the `${VAR}` references of the compose files. If one side names a variable that the other does not, `pnpm test` fails.
- Mark a required value with `${VAR:?message}`, and name the variable in the message.
- `api.env` names every variable of `backendEnvSchema` and no other. `infra/cdk/lib/docker-api-env.test.ts` checks this, so a bad line fails the checklist and not the container.
