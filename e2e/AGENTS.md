# E2E suites

## Layout

Each app has one E2E suite, in a workspace package named after the directory of the app in `apps/`. Delete a suite together with its app. `kit/` holds the harness and runs no test. Before you change the global setup of a suite, or a file that it imports, read `kit/AGENTS.md`.

Run a suite with `pnpm e2e:<app>` from the repo root. `<app>` is the app name without its role prefix. `pnpm e2e` runs every suite, one after the other.

Each suite applies the generated migrations to a fresh local libSQL database file before it starts the app. A schema change needs its migration before the suite can see it.

## Which test

| Change                         | Test                                                    |
| ------------------------------ | ------------------------------------------------------- |
| An endpoint                    | The API suite of each app that serves the route         |
| A storage query                | The API suite, through the endpoint that runs the query |
| A page, a flow, or a component | The browser suite of the app                            |
| Pure logic                     | A unit test next to the source                          |

Storage has no unit tests. An E2E case through an endpoint covers it.

## Every suite

- Build test data with one `faker` factory for each entity. The factory returns the type of the schema.
- Use `crypto.randomUUID()` for a UUID. Zod rejects a placeholder such as `00000000-0000-0000-0000-000000000001`, and the result is a misleading 400.
- Derive a case from the models and the requirements, not from the implementation. A test that mirrors the code cannot catch a bug in it.
- Run each dependency of the app in a local container that the lifecycle starts, or in a local mock such as the OpenID provider. If the app gains a dependency, add its container to `e2e-kit/containers`.
- Make each test independent. It sets up its own state and does not depend on the order of the tests.
- If a test needs a precondition or a narrowed type, call a helper from `e2e-kit/assertions`. Do not put `expect` inside an `if`.

## API suites

An API suite mirrors the routers of its app.

### Files

- Give each router a folder, `<domain>/`. It holds `api.ts` with the route wrappers and `utils.ts` with the factories.
- Give a route outside a router, such as the health probe, a folder named after the route.
- Give each endpoint one file, `<domain>/<endpoint>.test.ts`, without a domain prefix: `<domain>/create.test.ts`.
- Put a business rule, an edge case or an error path in the file of the endpoint that triggers it.
- Put a behavior that no endpoint owns, such as auth on every route, in a folder named after that behavior.
- Call another endpoint only to set up or read back state.

### Statuses

The route definition in `packages/api-routes/` is the spec. Each status that it declares gets at least one case that triggers it.

Request validation is the exception. Every router runs the validation hook of `createRouter`, and a unit test in `packages/backend-shared/` covers that hook. Write a `400` case only for a rule that the service checks, or for a security limit such as the upload size.

### Assertions

- Assert each success status with `expectStatus`. It prints the response data when it fails.
- Assert each error status with `expectApiError`, with the status and the error code. If two errors of one status share a code, pass the message too.
- In the basic success case of each endpoint, assert the whole body with `toStrictEqual` against an object built from the input. A field-by-field check misses a wrong or leaked field.
- Match a value that the server generates with a matcher from `e2e-kit/matchers`, not with `toBeDefined`.
- In the basic case of a write endpoint, read the resource back and compare it to the write response. If the domain has no read by id, find it in the list.
- In every other case, assert only the fields under test, with `toMatchObject` or a field matcher.
- Each test starts with empty tables. Assert a list, a count, an order or a page exactly with `toStrictEqual`, against the rows that the test created.
- Never use `it.concurrent` or `describe.concurrent`. The tables are shared, so tests run one at a time.
- If an endpoint returns a URL or an upload ticket, use it in the success case. Upload through the ticket, download through the URL, and compare the bytes.

## Browser suites

Drive every `ui-components` primitive through a helper from `e2e-ui-components`. Before you add or change a helper, read `ui-components/AGENTS.md`.

### Files

- Give each page one spec, named after the route of the page: `<route>.test.ts`.
- Give the shell, the navigation and the auth redirects one spec each.

### Cases

- Keep a case that proves the main job of the page end to end. The page renders real data, and its main actions reach the API and show the result.
- Keep a case for logic that only the frontend holds: client state, guards, redirects, and the empty or error states that a user can reach.
- A rule that the API suite already covers, such as validation or a calculation, gets one case here at most. The case proves that the error or the value reaches the screen.
- Never test layout or pixel details.
- Merge cases that differ only in their input into one loop over the inputs.

### Locators and assertions

- Read app strings with `t("<namespace>", ...)` and `ui-components` strings with `t("ui", ...)`. Never write UI text in a test.
- Match an element by role, label, placeholder or text. Never use `data-testid`.
- Use `.first()` or `.nth()` only to pick between case-insensitive label matches, with a comment at each use.
- If an icon-only control has no accessible name, add an `aria-label` and an i18n key in the component. Never work around it with a CSS selector.
- A control inside an accordion trigger joins the accessible name of that trigger. Match such an item with `["contains", ...]`, never `["exact", ...]`.
- Put the test data of an entity in named camelCase constants inside the test. Append `crypto.randomUUID()` to each name, so two tests never collide.
- Give a spinner a `title`, and wait on it with `expectSpinner` or `expectSpinnerHidden`. Never use `page.waitForTimeout`.
- Assert every toast that an action raises with `expectToast`, then dismiss it with `dismissToast`. `expectToast` matches the description, and `dismissToast` clears the viewport for the next action.
- After a mutation, assert the toast and the change in the UI. A toast alone is no proof.
- After you confirm a delete, assert the dialog hidden, then the spinner hidden, then the row gone. The overlay of the dialog can hide a row that still exists.
- Target a row action by its accessible name with `clickTableRowAction`, never with a bare `row.getByRole("button")`.

## Parallel runs

Run one suite at a time. Each setup builds its app in the app folder, and a browser suite also builds the API that it calls, so two runs at once overwrite each other's build. `pnpm e2e` and `pnpm e2e:<app>` already run one runner after the other. CI is safe: each E2E job has its own checkout.
