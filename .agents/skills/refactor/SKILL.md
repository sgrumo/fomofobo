---
name: refactor
description: Proposes idiom refactors for the lines in the current diff. The behavior does not change.
user-invocable: true
---

# Refactor Skill

Review the pending changes in the working tree and propose targeted refactors that lean on modern JS/TS idioms and the libraries this repo already uses. Do not rewrite unrelated code — only touch lines that are part of the current diff. Do not change behavior.

## Steps

1. **Gather the diff.** Run `git diff` and `git diff --staged` via Bash — the project CLAUDE.md allows read-only `git diff`. Only the lines that are part of the pending change are in scope.
2. **Scan each hunk against the checklist below.** For every candidate note:
    - File + line reference
    - The current snippet (quote it)
    - The proposed rewrite
    - Why it's better (readability, exhaustiveness, fewer allocations, codebase convention, etc.)
3. **Skip false positives.** If the pattern is genuinely clearer as-is (trivial 2-branch ternary, hot loop where `for` wins, etc.), leave it. Don't refactor for its own sake.
4. **Present the findings first.** Use the output format below. Wait for the user to pick which to apply, then edit.
5. **Run `pnpm checklist`** after edits and fix anything that breaks (lint, typecheck, tests). Re-run relevant E2E tests if behavior-adjacent code was touched.

## Checklist — what to look for

### ts-pattern (CLAUDE.md Code Style section)

- Chains of `if / else if / else` on the same discriminator → `match(x).with(...).with(...).exhaustive()`.
- Nested ternaries >2 levels deep → `match` usually reads better.
- `switch` on a discriminated union without a `default` → `.exhaustive()` for compile-time coverage.
- Return type already has a named type (e.g. `ItemStatus`) → add `.returnType<T>()` so branches don't need `as const`.
- Only use `.otherwise()` when there's a genuine fallback (unknown external input, catch-all). Default to `.exhaustive()`.
- Numeric ranges / comparisons → `P.number.gt(n)`, `P.number.between(a, b)`, etc.
- Storage sort-column selectors: a `sortBy === "a" ? tbl.a : sortBy === "b" ? tbl.b : tbl.c` chain driven by a Zod enum → `match(sortBy).with(...).exhaustive()`. Exhaustiveness catches new enum values added to the schema. Also applies when the branches return `sql\`...\`` fragments.
- Multiple enum cases sharing a branch → pass them as multi-arg `.with("a", "b", () => ...)` instead of repeating the handler.
- Do NOT rewrite simple 2-branch conditions — a ternary or `if` is fine.

### Modern JS built-ins (CLAUDE.md)

- Manual grouping loops → `Object.groupBy(arr, fn)` or `Map.groupBy(arr, fn)`.
- Manual dedupe via loop / `indexOf` → `new Set(arr)` / `Array.from(new Set(arr))`.
- Set arithmetic (`arr.filter(x => other.includes(x))`, `arr.filter(x => !other.includes(x))`) → `setA.intersection(setB)` / `.difference(setB)` / `.union(setB)`.
- Pairs of `Object.keys` / `map` → `Object.entries(obj)` + `Object.fromEntries(entries)`.
- `reduce` that spreads into an accumulator (`(acc, [k, v]) => ({ ...acc, [k]: v })`) → `Object.fromEntries(...)` (also avoids the O(n²) spread-in-reduce trap).
- `.includes()` on a tiny constant array in a hot path → `Set`; leave small cold paths alone.

### es-toolkit (CLAUDE.md: prefer over hand-rolled, never lodash)

- Hand-rolled `chunk`, `groupBy`, `keyBy`, `sumBy`, `meanBy`, `minBy`, `maxBy`, `partition`, `pick`, `omit`, `mapValues`, `mapKeys`, `uniq`, `uniqBy`, `zip`, `range` → swap in the es-toolkit helper.
- Pass-through callbacks like `x => x` → `identity` from es-toolkit.
- Prefer `Object.groupBy` / `Map.groupBy` when grouping is simple; reach for es-toolkit's variants when a selector reads better.

### Date & time (date-fns)

`date-fns` is available in the frontend, backend, and `packages/storage`. Prefer it over hand-rolled `Date` mutation.

- `.setMonth()` / `.setDate()` / `.setHours()` / `setUTCMonth()` chains → `date-fns` helpers (`subMonths`, `addMonths`, `startOfMonth`, `startOfWeek`, `endOfWeek`, `startOfQuarter`, `subQuarters`, `differenceInCalendarMonths`, `format`, etc.).
- Manual "start of current week (Mon-based)" — `new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0,0,0,0)` → `startOfWeek(now, { weekStartsOn: 1 })` (and `endOfWeek` with the same option). date-fns handles the Sunday edge case correctly; the hand-rolled version usually doesn't.
- Manual `"yyyy-MM"` / `"yyyy-MM-dd"` keys built with `getFullYear()` + `String(getMonth()+1).padStart(2, "0")` → `format(date, "yyyy-MM")` / `"yyyy-MM-dd"`.
- Calendar math: `(now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())` → `differenceInCalendarMonths(now, start)`.
- **UTC caveat.** `date-fns` operates in the host's local timezone. If the original code uses `setUTCMonth` / `new Date(\`...-01T00:00:00.000Z\`)`because it *needs* UTC semantics (e.g. matching a DB column stored in UTC), do NOT blindly swap to`startOfMonth(...)`— on a non-UTC host it returns a different instant. Prefer`new Date(Date.UTC(year, monthIndex, 1))`/`new Date(Date.UTC(year, monthIndex + 1, 1))`for UTC month bounds; it's the cleanest replacement for`setUTCMonth` chains without introducing a timezone bug.
- Dropping a date format/key to match a DB column stored as UTC (e.g. grouping `scheduledDate` by day) → `scheduledDate.toISOString().slice(0, 10)` is the UTC-safe equivalent of `format(d, "yyyy-MM-dd")`.

### SQL projections vs JS transform

Raw `sql\`...\`` tagged templates in Drizzle queries bypass type inference. Whenever the SQL is a pure projection that could run in JS after fetching, move it out.

- `sql<string>\`date(${tbl.col})\``used only to`.groupBy()`→ select the raw`tbl.col`timestamp and group in JS with`countBy(rows, r => r.col.toISOString().slice(0, 10))`(or`Map.groupBy`/`Object.groupBy` for non-count aggregates). Restores Drizzle type safety on the selected row.
- Simple per-row transforms (`sql\`lower(${col})\``, `sql\`coalesce(${a}, ${b})\``) used only to filter/map downstream → pull the columns, transform in JS.
- **Keep in SQL** (do NOT move to JS):
    - True aggregations: `count()`, `count(*) filter (where ...)`, `sum`, `avg`, `min`, `max`, `greatest` across joined tables.
    - Anything that would force a 10×/100× increase in fetched rows.
    - Sort expressions that the DB needs for `ORDER BY` / pagination.
    - `sql\`now()\``, `sql\`1\`` markers in subqueries — cosmetically raw SQL but not a type-safety boundary.

### Storage method params from models

Storage methods often accept object params that mirror an existing Zod list/filter/update schema. Don't re-declare the shape.

- `public async listPaginated(params: { tenantId?: string; ...; sortBy: "a" | "b" | "c"; sortOrder: "asc" | "desc" })` when `packages/models/` already exports a matching `XListQuery` type → `params: XListQuery & { userId: string }` (or equivalent intersection for contextual fields the query doesn't carry).
- Service-layer forwarding that copies every query field into the storage call — `storage.list({ page: q.page, pageSize: q.pageSize, search: q.search, sortBy: q.sortBy, ... })` → `storage.list(q)` or `storage.list({ ...q, userId })`. Stops signatures from drifting when the model gains a field.
- Inlined string-literal unions that duplicate a Zod `z.enum` in models → delete them; the inferred model type already carries the union.

### Declarative array building (CLAUDE.md)

- `const arr: T[] = []; if (cond) arr.push(x)` → `[cond ? x : undefined, ...].filter(defined)` or conditional spread.
- `let` + `for` that accumulates into a variable → `.reduce`, `.map`, `.flatMap`, `.filter`, `.find`, `.some`, `.every`.
- `.forEach` is banned — replace with `for (const x of arr)` when a side-effectful loop is actually needed.

### Types & narrowing (CLAUDE.md: no `any`, no `as`, no `is` in `.filter`)

- `.filter((x): x is T => x !== undefined)` → `.filter(defined)` (narrowing is automatic in this repo).
- `as` casts → replace with `satisfies`, proper generics, or a Zod `.parse`.
- `any` → a precise type or `unknown` + narrow.
- Inline `import { type X }` → separate `import type { X }` line.
- `function foo()` → `const foo = () => ...`.
- Inline string-literal unions that duplicate a Zod `z.enum` — e.g. a service method typed `role: "admin" | "member"` when `packages/models/` already exports a `Role` / `UserRole` (or similar) inferred from a `z.enum` → swap to the imported type. One source of truth for the union's members.
- Untyped intermediate pipeline step (`.map(...)`, `.flatMap(...)`, `Array.from(iter, fn)`, etc.) that produces a known named shape — model type, Drizzle `$inferInsert`/`$inferSelect`, exported domain type — consider annotating the step explicitly. Two equivalent forms:
    - Generic on the operator: `arr.map<T>(...)`, `arr.flatMap<T>(...)`.
    - Return-type annotation on the callback: `(x): T => ...` — useful when the operator's generics are awkward (e.g. `Array.from`).
      The annotation turns silent assignability widening into a compile error if the callback's output drifts from the consumer's shape (model gains/loses a field, table gains a required column). **Apply judgment** — it pays off when the named shape is stable and the mapper builds it from scratch (DB row → model, building insert payloads, transforms that return a domain type). It adds noise when the inferred type is already tightly tied to a typed consumer (single-call helpers, scratch shapes used only within the function), or when the named type isn't more informative than the inferred one.

### Loops → array methods

- `for` building a new array of the same length → `.map`.
- `for` that filters → `.filter`.
- `for` that finds one → `.find` / `.some`.
- Keep `for` when it early-exits with complex control flow, mutates an external accumulator in ways array methods obscure, or is in a perf-critical inner loop.

### Models & schemas (Zod in `packages/models/`)

When the diff introduces or edits schemas/types, check whether they can be pruned or derived rather than duplicated.

- **Derive, don't duplicate.** Two schemas that share most fields → define a base and derive the variants with `.extend()`, `.merge()`, `.omit()`, `.pick()`, `.partial()`, `.required()`. Typical pairs: `Create*` / `Update*` / `*` (full entity) / `*Summary` — these should almost always come off one base.
- **Types from schemas.** A hand-written `type` that mirrors a schema → `type X = z.infer<typeof xSchema>`. Never maintain the two in parallel.
- **IDs and enums reused across files.** If the same string literal union or UUID-branded type appears in >1 schema, extract it to a shared `zEnum`/id schema in `packages/models/` and import it.
- **Discriminated unions over optional-field soup.** A schema with several mutually-exclusive optional fields gated by a `kind`/`type`/`status` flag → `z.discriminatedUnion("kind", [...])`. Each variant only carries the fields it actually needs; consumers get exhaustive `match` narrowing for free.
- **`z.enum` over string unions.** A repeated `z.union([z.literal("a"), z.literal("b"), ...])` or a bare `"a" | "b" | "c"` TS type used at runtime → `z.enum(["a", "b", "c"])`. Gives you `.options` for iteration, `.Values` for lookup, and a single source of truth for both the runtime validator and the TS type.
- **Enum values centralized.** If the same enum appears in models, storage (Drizzle), and i18n keys, keep the source of truth in `packages/models/` and reference it everywhere — no parallel string arrays.
- **Prune dead fields.** Newly introduced fields that no caller reads, or legacy fields left behind after a rename, should be removed now while the diff is still local — don't defer.
- **Narrow before widening.** Prefer the tightest schema that satisfies the caller (`.pick` a handful of fields) over passing the full entity when only a few are used. Keeps API payloads and types honest.

## Project-specific reminders

Before suggesting a refactor, re-read the relevant sections of the root `CLAUDE.md` and any nested ones (e.g. `e2e/<api-app>/CLAUDE.md`). Examples that trip up naive refactors:

- `const` over `function` for functions.
- `.forEach` is banned.
- No region-dividing comments.
- Files are kebab-case; unused params prefixed `_`.

## Output format

Write findings as a structured report grouped by **checklist category** (`### ts-pattern`, `### Modern built-ins`, `### es-toolkit`, `### Date & time`, `### SQL vs JS`, `### Storage params`, `### Declarative array building`, `### Types & narrowing`, `### Loops`, `### Schemas`). Only include categories that have findings.

Each finding is a single bullet:

- `path/to/file.ts:line` — short description of the swap and why it's better.

Add minimal before/after snippets **only** when the rewrite isn't obvious from the description. A few lines each, not whole functions. For trivial one-liners, inline the rewrite in the description (e.g. `→ .filter(defined)`) and skip the code blocks.

Example:

    ### ts-pattern
    - `apps/<api-app>/src/services/item-service.ts:87` — nested `if/else if` on `status` → `match(...).exhaustive()` for compile-time coverage.
      ```ts
      // before
      if (status === "pending") return 0
      else if (status === "shipped") return 1
      else return 2
      ```
      ```ts
      // after
      return match(status)
          .with("pending", () => 0)
          .with("shipped", () => 1)
          .with("delivered", () => 2)
          .exhaustive()
      ```

    ### Types & narrowing
    - `apps/<web-app>/src/components/foo.tsx:12` — `.filter((x): x is Bar => x != null)` → `.filter(defined)`.

Close with a short prompt: **"Apply all, some, or skip? Call out which."**

### When there are no findings

One line:

> **No refactors.** Scanned <N> changed files; code matches repo conventions.

Add at most one "considered but rejected" bullet with `file:line` and a one-sentence reason, only if the borderline call is genuinely worth flagging.

## Do NOT

- Do not refactor code that isn't part of the current diff.
- Do not change behavior, naming, or public API.
- Do not touch generated files (migrations, lockfiles, build output).
- Do not bundle unrelated cleanups into the same pass.
- Do not skip the `pnpm checklist` run after applying edits.
