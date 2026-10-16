pnpm monorepo - see `README.md` for structure overview.

## Core Rules

Critical rules for **ALL** packages. **Non-compliance will not be tolerated.**

- **ALWAYS** apply when writing code
- **ALWAYS** check when reviewing code changes

**Folder rules**

- **CRITICAL** Before you change a file, read every `AGENTS.md` on its path, from the root down to the folder of the file. For `packages/<package>/src/lib/x.ts`, read `packages/<package>/AGENTS.md`.
- Read them even when you edit through the shell. Only a read with the file tool loads them on its own.
- Each new folder you touch needs its own check. A file you already read this session needs no second read.

**English**

- **ALWAYS** write code and docs in English.
- Identifiers, enum values, props, types, functions, files, DB columns: English only.
- Comments, docs, and tests: English only.
- Input in another language stays input. If the user pastes an Italian call transcript or spec, translate the concepts and name the code in English.
- Only user-facing copy in i18n locale files holds another language.
- If the user explicitly asks for another language, use that language.

**Docs**

- **CRITICAL** If a change alters the product scope, a business rule, or the architecture, invoke `/project-docs` and update `docs/product.md` in the same commit. If the change passes the history test of `/project-docs`, add the `docs/history.md` entry in the same commit too.
- **ALWAYS** invoke `/project-docs` before you add or change a file in `docs/`.

**Changes**

- **ALWAYS** grep for every caller, reference and data flow before you change code. Do the full audit on the first pass - do not wait for the user to ask for it.

**Apps**

- One app in `apps/` is one program. A program does one job on one trigger.
- Runtime adapters of one program stay in one app (e.g. a Node server and a Lambda handler).
- **NEVER** add a second program to an existing app. Create a new app for it.
- If two apps need the same code, the repo decides where that code lives. If the repo has no rule for it, ask the user.

**Dependencies**

- Declare in each package manifest what that package imports and what its scripts run.
- If two or more packages need one dependency, declare its version in the `catalog:` block of `pnpm-workspace.yaml`. Each of those manifests then carries `catalog:` in place of a version.
- If one package needs the dependency, keep the version in that manifest.

**Shell**

- **CRITICAL** `git` rules:
    - Read-only commands are always allowed: `git diff`, `git status`, `git log`, `git show`, `git range-diff`, `git rev-parse`.
    - `git add`, `git commit`, `git rebase`, `git merge`, `git cherry-pick` and `git branch <name>` are allowed **only** when the user explicitly asks for that operation (e.g. `/commit`). Never run them autonomously.
    - If a rebase, merge or cherry-pick is in progress, ask the user if you can finish it. A yes covers each step to the end, `git add` included.
    - Before you rewrite history, save the start SHA. If the branch differs from `origin` or the working tree is dirty, be extra careful. After, make sure that no work is lost.
    - **NEVER** run any other `git` command that changes the repo or a remote (push, reset, checkout, stash, branch delete or overwrite, etc.).

**Types & Imports:**

- **NEVER** use `any`, `as` casting, or a `!` non-null assertion - use a proper type, or validate the value
- Explicit type annotations **ONLY** when needed (inlined data, function params, etc)
- **NEVER** `is` type guards in `.filter` - narrowing is automatic
- **ALWAYS** `const` for functions, not `function`
- **NO** region-dividing comments unless explicitly requested
- **Avoid untyped Zod `.parse()`**: Don't use `schema.parse(untypedValue)` to bypass TypeScript - it silently erases the type-checking bridge between layers (e.g., DB -> model). Use `.parse()` only at true system boundaries (external API responses, `JSON.parse` results, user input). For internal data, let TypeScript enforce the mapping - if types don't align, fix the types, don't `.parse()` them away.

**Naming**

- **ALWAYS** kebab-case for files.
- Write an acronym as one word: `userId`, `apiClient`, `loadHttpUrl`. A name that a platform or a library sets keeps its case: `XMLHttpRequest`, `randomUUID`, `GET` in a Next route.
- `CONSTANT_CASE` only for a module-level value that never changes and is built once: a limit, a fixed lookup table. A const inside a function, or a value built more than once, is `lowerCamelCase`.
- A type parameter is `T` when it is the only one and its role is obvious. Otherwise use `T` plus a name: `TRow`, `TError`.
- A `_` prefix only marks an unused variable or parameter.

## Code Style

### Prefer declarative over imperative

- **Avoid `let` + loops**: Use `.find()`, `.map()`, `.filter()`, `.reduce()`, `.some()`, `.every()`, `.flatMap()` instead of `let` + `for` loops. If you need to find an item, use `.find()` - never declare a `let` variable and loop to assign it.
- **Default to `.reduce`** for accumulation, `for` **ONLY** when it clearly helps readability.
- **NEVER** `.forEach()` - use `for(const x of arr)` when a loop is needed.
- **Avoid manual array building**: Instead of `const arr = []; if (x) arr.push(...)`, use `[x ? mapX(x) : undefined, y ? mapY(y) : undefined].filter(defined)`.
- **Ternary over simple if/else**: For simple conditional assignments, prefer ternary operators. Avoid when they hurt readability (nested ternaries).
- **Prefer `const`**: Use `let` only when mutation is truly unavoidable. Build data with expressions (ternary, spread, array methods), not statements (if/push/reassign).

### Comments

**Write timeless comments**: a comment describes the code as it is **now**. Never narrate history, iterations, or transitions ("changed to X", "now resolves instead of...", "previously we...") - that's what `git` is for.

#### JSDoc: what gets one

| Declaration                        | Rule                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| Class methods                      | **ALWAYS**, except trivial forwarders, trivial private helpers                          |
| Top level functions                | **ALWAYS**, except React components, trivial forwarders, trivial private helpers        |
| Top level helper types             | **ONLY** function-like helpers with generics, **NEVER** interfaces/interface-like types |
| Top level consts, class attributes | **ONLY** when something non-trivial needs saying (through `@remarks`)                   |

**NOTHING** else gets one

#### JSDoc: how to write it

**Allowed tags - closed set.**

| Tag            | When                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| `@description` | **ALWAYS**, first, exactly one                                                              |
| `@template`    | One per type parameter, in order: name + **SMALL** description. **NO** re-stating `extends` |
| `@param`       | One per parameter, in order: name + **SMALL** description. **NO** types                     |
| `@throws`      | **ONLY** when a function **EXPLICITLY** throws                                              |
| `@remarks`     | **ONLY** a **REAL** caveat about using **this** declaration                                 |
| `@example`     | **ONLY** when the call shape or output is genuinely non-obvious                             |

**Tag-specific rules:**

- `@description`
    - Opens with a third-person verb, no subject: "Builds...", "Returns...". Never "This function..." or "Build...".
    - One sentence.
- `@throws`
    - Opens with `When...`
    - Does **NOT** state nested throws
- `@remarks`
    - Opens with a third-person verb, no subject
    - One sentence
    - Does **NOT** state something the function does that is **NOT** a footgun
    - Does **NOT** state a nested throw
    - Does **NOT** state something about the function as it was before some change

**Language - telegraphic:**

- Telegraphic (impersonal, no filler, same-term/same-concept) language in **ALL** comments and JSDoc tags
- No filler ("simply", "basically", "just", "note that"), no hedging.
- Same term for the same concept:
    - **Returns** (pure derivation)
    - **Builds** (constructs data)
    - **Maps** (transforms)
    - **True when** (predicate)
    - **Fetches** (network/DB read)
    - **Persists** (DB write)

#### Inline comments (inside bodies and data declarations)

- Allowed **ONLY** when the reader **must** see the note at that exact line to not get it wrong, and it cannot live anywhere else.
- **MUST** adhere to telegraphic language.
- Data declarations follow the same rule: schema fields, enum values, table columns, and `//` comments above a schema or a table. The name and the type say what a field holds, so a field gets no comment by default.

### Pattern matching with ts-pattern

- Use `.exhaustive()` by default - compile-time exhaustiveness checking catches missing cases.
- Use `.otherwise()` only when a genuine default/fallback is needed (e.g., unknown external input, catch-all logging). Don't use it to skip handling known cases.
- Don't overuse for trivial 2-branch conditions - a simple ternary or `if` is fine there.
- `.returnType<T>()` when: return type needs `as const`, or type already exists/is reusable.
- `.returnType` set -> no `as const` in branches.
- One-off return type -> `as const` in branches is fine, skip `.returnType`.

### Utilities: es-toolkit

- Use `es-toolkit` for utility operations: `chunk`, `groupBy`, `keyBy`, `sumBy`, `partition`, `mapValues`, `uniq`, `pick`, `omit`, etc.
- **ALWAYS** `identity` for pass-through functions.
- Prefer es-toolkit over hand-rolled loops or lodash.

### Modern JS built-ins

- Prefer `Object.groupBy()` / `Map.groupBy()` over manual grouping loops or `es-toolkit/groupBy` when the logic is simple.
- Prefer `Set` for uniqueness checks and set operations (`.union()`, `.intersection()`, `.difference()`).

## Shared Packages

| Package                         | Import                  | Purpose                                                                                                                                                                                            |
| ------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/api-client/`          | `"api-client/*"`        | Typed frontend API layer built from `"api-routes"`: endpoint factories, cache keys, TanStack Query options. Apps inject the HTTP transport (axios on web, fetch on native)                         |
| `packages/api-routes/`          | `"api-routes"`          | OpenAPI route definitions. Import `z` from `"@hono/zod-openapi"` + use `.openapi("Name")` here. Import schemas from `"models"`                                                                     |
| `packages/backend-shared/`      | `"backend-shared/*"`    | Shared backend layer: logger and object storage at the root, the HTTP layer (`respond`, `createRouter`, `handleErrors`, `createErrorUtils`) under `/http`, the env schema builders under `/config` |
| `packages/components-samples/`  | `"components-samples"`  | Dev-only samples page that renders `ui-components` primitives with props tuned for the frontend E2E suites. Apps mount it on a dev route                                                           |
| `packages/components-showcase/` | `"components-showcase"` | Dev-only showcase page that renders every `ui-components` primitive. Apps mount it on a dev route                                                                                                  |
| `packages/frontend-shared/`     | `"frontend-shared/*"`   | Framework-agnostic frontend utilities (form error mapping, web storage wrappers, style helpers etc)                                                                                                |
| `packages/i18n/`                | `"i18n/*"`              | Framework-agnostic i18next core: language keys, Zod locale binding, translation mapping, locale-file checks for app tests                                                                          |
| `packages/models/`              | `"models"`              | Pure Zod schemas + inferred types. **NO** `.openapi()` here - that belongs in routes only                                                                                                          |
| `packages/obfuscation/`         | `"obfuscation/*"`       | Reversible string obfuscation/deobfuscation primitives (no crypto)                                                                                                                                 |
| `packages/react-i18n/`          | `"react-i18n/*"`        | React binding of `i18n`: `useLanguage` and `useDateFnsLocale` hooks, `useTranslation`-derived types. Each app owns its i18next init                                                                |
| `packages/react-shared/`        | `"react-shared"`        | React-specific shared utilities (hooks, ref helpers, web storage hooks etc)                                                                                                                        |
| `packages/shared/`              | `"shared/*"`            | Pure, context-agnostic TypeScript utilities                                                                                                                                                        |
| `packages/storage/`             | `"storage"`             | Thin DB access layer (Drizzle). **NO** business logic - that belongs in services. Import models from `"models"`                                                                                    |
| `packages/styles/`              | `"styles"`              | Shared Tailwind v4 global styles and design tokens (CSS)                                                                                                                                           |
| `packages/ui-components/`       | `"ui-components/*"`     | Shared React UI component library (Base UI primitives, wrapped and compound components)                                                                                                            |

### Enums

- Default to `z.enum(["a", "b", "c"])` in models - no `as const` array needed
- Extract values into an `xxxValues = [...] as const` array **only** when the enum is also used at DB level (a SQLite `text` enum column with its CHECK constraint) - see `/storage-patterns` for the full pattern
- **ALWAYS** kebab-case enum values: `"in-progress"`, never `"inProgress"` or `"in_progress"`. The oxlint rule `custom/kebab-case-enum-values` enforces this for `z.enum`
- Values in an external format keep that format (MIME types, language tags). Silence the rule with `// oxlint-disable-next-line custom/kebab-case-enum-values`

## Infrastructure & Deployment

These apps are deployed, not only run locally. `infra/` holds every deploy target, one folder each, and the `README.md` and `AGENTS.md` of that folder document it. **Before** you change env vars, secrets, DB, object storage, networking or deploy, read them. **NEVER** assume a topology.

**Before** you add or move a secret or a variable, in a workflow or in any deploy target, read "Secrets and configuration" in `infra/AGENTS.md`.

**Before** a workflow change leaves new state on the CI runner host, read `.github/AGENTS.md`.

## Per-App Rules

Each app and most packages have their own `AGENTS.md` with their own conventions. See **Folder rules** for when to read them.

Shared tool config (`oxlint`, `tsconfig`, `vitest`, `checklist`) lives in `configs/`. Its `CLAUDE.md` lists known lint/format conflicts and how to act on them. If the checklist passes and then fails on a rerun, or `lint:fix` and `fmt` rewrite the same line, read it and report to the user - never patch the code shape to dodge a rule.

## Checklist

**CRITICAL**: before yielding control, run **exactly** this — nothing more, nothing less:

```
pnpm checklist
```

This is **THE ONLY** command you are to run before yielding control (unless **EXPLICITLY** told otherwise) since it checks **EVERYTHING**. The E2E suites are the one exception, because the checklist does not run them.

**Forbidden modifications** (all of these are wrong, no exceptions):

- **NO** env var prefix — the runner **auto-detects** agents on its own. Do **NOT** prepend `AGENT=true`, `CI=true`, or anything else
- **NO** flags, arguments, or trailing tokens after `pnpm checklist`
- **NO** output filter — see [Verification output](#verification-output)
- **NO** timeout wrappers, `&&`-chains, or shell tricks around it

## Verification output

The verification commands are `checklist`, `test`, `e2e*`, `typecheck`, `lint*`, `build`, `vitest` and `playwright`. Each run writes its full output to a file under `.ignored/`:

| File                                 | Content                                                  |
| ------------------------------------ | -------------------------------------------------------- |
| `.ignored/checklist.log`             | Full output of the last `pnpm checklist`                 |
| `.ignored/tests/unit-<package>.json` | Vitest report of the unit tests of one package           |
| `.ignored/tests/e2e-<report>.json`   | Report of one E2E runner                                 |
| `.ignored/tests/<report>.junit.xml`  | JUnit copy of each report, for the CI test report        |
| `.ignored/tests/e2e-<report>/`       | Playwright HTML report (`html/`) and traces (`results/`) |

- **NEVER** pipe, redirect or `tee` a verification command: not `| tail`, `| grep`, `2>&1`, `> file`, **nothing**
- Use the exit code and the terminal outcome
- If you need more, read the file under `.ignored/`. Do **NOT** run the command again to get more output
- A run that stops early writes no report. The old file stays, so compare its time with the run

## Tests

Put a unit test next to the source it exercises, inside its package.

**NEVER** call an external service or API from a test, in any circumstance. A unit test mocks the boundary.

Test files share a worker and its module cache. A test that changes global state (timers, DOM, module-level variables, globals) restores it. If a suite cannot, set `isolate: true` in its config with the reason.

Write or update the E2E tests that `e2e/AGENTS.md` names for each change of behavior. If your change touches an app that an E2E suite covers, run that suite before you declare the task done. A suite with two runners writes one report for each, suffixed `-api` and `-ui`.

### What a test extracts

Write every step of a test in its body: each setup call, its status check, a small transform such as a sort, and every assertion. A reader then sees what the test does without opening another file.

- Extract a factory that builds a mock object or a payload.
- Extract a setup of several steps that many files repeat, such as an upload through a ticket.
- Extract nothing else. A helper that wraps one call and its check, or one call and a sort, stays inline.
- Repeat a few lines across the cases of a file before you extract them.
