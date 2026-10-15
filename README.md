# fomofobo

fomofobo is a modular monorepo housing the apps and shared packages that make up the system.

## Monorepo Structure

The repo is split into **apps** (deployable applications) and **packages** (shared libraries consumed by apps or other libraries).

Every package declares its own dependencies. `pnpm-workspace.yaml` holds the version of each dependency that two or more packages share.

### Apps

Deployable applications.

| App                  | Description                                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fullstack-fomofobo` | Next.js fullstack app - App Router with Hono + OpenAPI API routes, Server Component prefetch, Server Action mutations, Tailwind, TanStack Query, react-i18next |

### Packages

Shared libraries consumed by apps via pnpm workspace references.

| Package          | Description                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api-client`     | Typed frontend API layer generated from `api-routes`: endpoint factories, cache keys and TanStack Query options, with the HTTP transport injected per app |
| `api-routes`     | OpenAPI-compliant REST route definitions built with `@hono/zod-openapi`                                                                                   |
| `backend-shared` | Common backend utilities: Winston logger, environment-aware configuration                                                                                 |
| `models`         | Zod schemas and inferred TypeScript types shared across frontend and backend                                                                              |
| `i18n`           | Framework-agnostic i18next core: language keys, translation mapping, and locale-file checks for app tests                                                 |
| `react-i18n`     | React binding of the i18n package: language hooks, translation types                                                                                      |
| `obfuscation`    | Reversible string obfuscation/deobfuscation primitives (no crypto)                                                                                        |
| `storage`        | PostgreSQL data access layer using Drizzle ORM (schema, migrations, repositories)                                                                         |

### Database

The `packages/storage/migrations/` directory holds Drizzle-generated SQL migration files. Migrations are generated from the schema in `packages/storage/src/db-schema.ts` using the config at `packages/storage/drizzle.config.ts`.

### Infrastructure

[`infra/`](infra/) holds the deploy docs, and [`.github/`](.github/) the CI docs.

### Scripts & Test

| Package                  | Description                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `i18n-sheets`            | Google Sheets translation download/export tooling                                                            |
| `obfuscate`              | CLI that obfuscates a string via the `obfuscation` package                                                   |
| `with-env`               | Bin that loads the env file of a Next or Expo dev script, then runs its command. See [Env files](#env-files) |
| `e2e-kit`                | Harness the E2E suites share: containers, servers, lifecycle, Playwright config                              |
| `e2e-ui-components`      | E2E helpers of every `ui-components` primitive, and the tests that drive them                                |
| `e2e-fullstack-fomofobo` | E2E suites of the fullstack app: the API (Vitest) and the pages (Playwright)                                 |

## Commands

| Command                    | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `pnpm dev:fomofobo`        | Start the fomofobo fullstack dev server                |
| `pnpm checklist`           | Full CI check: typecheck, test, lint, format, build    |
| `pnpm typecheck`           | Typecheck all packages                                 |
| `pnpm lint:fix`            | Lint and autofix all packages                          |
| `pnpm test`                | Run unit tests across all packages                     |
| `pnpm e2e`                 | Run every E2E suite, one after the other               |
| `pnpm e2e:fomofobo`        | Run the E2E suites of the fomofobo app, API then pages |
| `pnpm build`               | Build all packages                                     |
| `pnpm db:gen-migration`    | Generate migration SQL from schema changes             |
| `pnpm db:custom-migration` | Generate an empty migration for a data change          |
| `pnpm db:migrate`          | Run pending migrations                                 |
| `pnpm db:force-push`       | Push schema directly to DB (dev only)                  |

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
