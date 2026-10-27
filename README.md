# fomofobo

fomofobo is a modular monorepo housing the apps and shared packages that make up the system.

## Monorepo Structure

The repo is split into **apps** (deployable applications) and **packages** (shared libraries consumed by apps or other libraries).

Every package declares its own dependencies. `pnpm-workspace.yaml` holds the version of each dependency that two or more packages share.

### Apps

Deployable applications.

| App                  | Description                                                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fullstack-fomofobo` | Next.js fullstack app - App Router with Hono + OpenAPI API routes, Server Component prefetch, Server Action mutations, Tailwind, TanStack Query, react-i18next  |
| `mobile-fomofobo`    | Expo native app with the public features of the web app, no sign-in. It calls the API of `fullstack-fomofobo`. See its [README](apps/mobile-fomofobo/README.md) |
| `photo-purge`        | Daily job that deletes from the bucket the photos of the events that left the public app. `.github/workflows/purge-photos.yaml` runs it                         |

### Packages

Shared libraries consumed by apps via pnpm workspace references.

| Package          | Description                                                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api-client`     | Typed frontend API layer generated from `api-routes`: endpoint factories, cache keys and TanStack Query options, with the HTTP transport injected per app        |
| `api-routes`     | OpenAPI-compliant REST route definitions built with `@hono/zod-openapi`                                                                                          |
| `backend-shared` | Common backend utilities: Winston logger, environment-aware configuration                                                                                        |
| `domain`         | Pure domain logic of the public clients, web and native, with no React and no DOM: status, time formats, map spots, prices, save queue, share links, pixel icons |
| `models`         | Zod schemas and inferred TypeScript types shared across frontend and backend                                                                                     |
| `i18n`           | Framework-agnostic i18next core: language keys, translation mapping, and locale-file checks for app tests                                                        |
| `react-i18n`     | React binding of the i18n package: language hooks, translation types                                                                                             |
| `obfuscation`    | Reversible string obfuscation/deobfuscation primitives (no crypto)                                                                                               |
| `storage`        | libSQL data access layer using Drizzle ORM (schema, migrations, repositories)                                                                                    |

### Database

The `packages/storage/migrations/` directory holds Drizzle-generated SQL migration files. Migrations are generated from the schema in `packages/storage/src/db-schema.ts` using the config at `packages/storage/drizzle.config.ts`. `drizzle-kit migrate` applies them through `packages/storage/drizzle.migrate.config.ts` to the database of `DATABASE_URL`: the local file, or Turso on each deploy.

The backoffice has no sign-up. To sign in, create an Admin with the `admin-accounts` CLI, which prompts for the password:

```bash
DATABASE_URL=file:../../.data/local.db pnpm admin-accounts create-admin --name "<name>" --email <email>
```

The CLI runs inside `scripts/admin-accounts`, so a `file:` URL is relative to that folder. For Turso, pass its `libsql:` URL and `DATABASE_AUTH_TOKEN`. `reset-password --email <email>` sets a new password of any account and ends its sessions. The dev seed accounts have no password until you set one.

### Infrastructure

[`infra/`](infra/) holds the deploy docs, and [`.github/`](.github/) the CI docs.

### Scripts & Test

| Package                  | Description                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `i18n-sheets`            | Google Sheets translation download/export tooling                                                                            |
| `admin-accounts`         | CLI that creates an Admin, or sets a new password of any account. See [Database](#database)                                  |
| `backoffice-cli`         | CLI that calls the backoffice API as the account of its env file, and uploads dithered photos. The `add-event` skill runs it |
| `obfuscate`              | CLI that obfuscates a string via the `obfuscation` package                                                                   |
| `dither-photos`          | CLI that replaces every stored event photo with its dithered PNG, once per environment                                       |
| `fallback-images`        | CLI that draws the fallback image of each category icon into `public/fallbacks/` of the app                                  |
| `with-env`               | Bin that loads the env file of a Next or Expo dev script, then runs its command. See [Env files](#env-files)                 |
| `e2e-kit`                | Harness the E2E suites share: containers, servers, lifecycle, Playwright config                                              |
| `e2e-ui-components`      | E2E helpers of every `ui-components` primitive, and the tests that drive them                                                |
| `e2e-fullstack-fomofobo` | E2E suites of the fullstack app: the API (Vitest) and the pages (Playwright)                                                 |
| `e2e-photo-purge`        | E2E suite of the photo purge job, on a database file and the object store                                                    |

## Commands

| Command                    | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `pnpm dev:fomofobo`        | Start the fomofobo fullstack dev server                |
| `pnpm dev:mobile:ios`      | Build and run the mobile app on the iOS simulator      |
| `pnpm dev:mobile:android`  | Build and run the mobile app on an Android emulator    |
| `pnpm checklist`           | Full CI check: typecheck, test, lint, format, build    |
| `pnpm typecheck`           | Typecheck all packages                                 |
| `pnpm lint:fix`            | Lint and autofix all packages                          |
| `pnpm test`                | Run unit tests across all packages                     |
| `pnpm e2e`                 | Run every E2E suite, one after the other               |
| `pnpm e2e:fomofobo`        | Run the E2E suites of the fomofobo app, API then pages |
| `pnpm e2e:photo-purge`     | Run the E2E suite of the photo purge job               |
| `pnpm build`               | Build all packages                                     |
| `pnpm db:gen-migration`    | Generate migration SQL from schema changes             |
| `pnpm db:custom-migration` | Generate an empty migration for a data change          |
| `pnpm db:migrate`          | Apply pending migrations to the local database file    |
| `pnpm db:seed`             | Replace the local database rows with the dev seed      |

### Env files

`ENV_NAME` picks the env file of a local dev run: `ENV_NAME=dev` selects `.env.dev` in the app directory, on top of the files the stack loads by default (`.env.local`, ...). Each dev script applies it the way its stack supports: `--mode` for Vite and Astro, `--env-file` for Node, the `with-env` bin for Next and Expo. Builds and production starts never read it: their environment comes from CI and the deploy target.

```bash
pnpm dev                          # the default env files of the stack
ENV_NAME=dev pnpm dev             # apps/<app>/.env.dev on top
ENV_NAME=dev pnpm dev:<app>       # same, from the repo root
```

A variable set in the shell wins over the file, and the file wins over `.env.local`. A key the file leaves out still comes from `.env.local`. Node and `with-env` stop when the file is missing. Vite and Astro run without it.

## Checklist

The repo uses a shared checklist runner (`scripts/checklist/checklist.sh`) driven by JSON config files. Each config is an array of `{ "command": "...", "label": "..." }` objects.

```
bash scripts/checklist/checklist.sh --config <config.json>
```

`pnpm checklist` auto-detects whether it's running under an AI agent (Claude Code, Cursor, Codex, Copilot, Gemini, etc.) and adapts its output: streamed full output for humans, silent-on-success with a `.ignored/checklist.log` for agents. No env var or flag is needed. Run `pnpm checklist`.

Currently there is a single config at `configs/checklist/repo.json` covering all packages. Additional configs can be added alongside it (e.g. `configs/checklist/<app>.json`) to run a checklist scoped to a single app instead of the whole repo.

## CI/CD

All pipelines are defined in `.github/workflows/`. [`.github/CICD.md`](.github/CICD.md) says how to enable a deploy.

## Claude Code Workflows

The repo ships structured Claude Code workflows for different task sizes, exposed as skills under `.agents/skills/`.

### Craft (`/craft`)

For complex, multi-file tasks. Creates a persistent plan file in `.plans/` with steps, microtasks, and checkpoints that survives context resets.

```
Comprehension -> Planning -> Checkpoint (user approval) -> Execution loop -> Closure
```

Key features:

- **Plan file** (`.plans/<task>.md`) with steps, microtasks, decisions log, and test registry
- **Context guard** - automatically pauses and saves state before context runs out
- **Resume** - after `/clear`, run `/resume-plan` to pick up exactly where it stopped
- **Progressive testing** - tests written and run per step, not just at the end

See [`.agents/skills/craft/SKILL.md`](.agents/skills/craft/SKILL.md) for the full plan file format and lifecycle.

#### Figma integration (`--figma`)

Use `/craft --figma` to enforce design adherence on UI steps. Requires a one-time setup:

```bash
# In Claude Code, run once per project:
/figma https://www.figma.com/design/your-file-id/...
```

This saves the link to `.figma.json`. When `--figma` is active, every step that touches UI must fetch the Figma design via MCP before writing code, and match the design exactly. The choice persists in the plan file (`figma: true`) and survives context resets.

**Requires:** a Figma MCP server configured in Claude Code (e.g. Figma Dev Mode MCP).

### Quick (`/quick`)

For simple, contained tasks (3 files or fewer, no new architecture).

```
Read -> Implement -> Test (if needed) -> Checklist -> Recap
```

No plan file, no checkpoints. If the task turns out to be more complex than expected, Quick suggests switching to `/craft`.

### Gigavibe (`/gigavibe`)

Project breakdown for a whole milestone: reads the analysis/design documents, explores the codebase, and generates a series of `/craft` plans. Plans only. It never writes code itself.
