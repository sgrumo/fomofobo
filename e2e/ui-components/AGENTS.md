# E2E UI helpers

Interaction helpers for every `ui-components` primitive, one file for each primitive in `src/`. Every browser suite imports them as `e2e-ui-components/<primitive>`.

## Samples

`src/samples.ts` is generated. Edit the `ui-samples.ts` generator, not the file. It exports `defineUiSamplesTests(app)`, which drives every helper against the samples page (`/dev/samples/`, package `components-samples`). Each browser suite calls it from its own `tests/ui-samples.test.ts` and passes the way its app opens that page. The helpers then run on every framework that renders the components.

The helpers read the `ui` strings from `src/locales/it/ui.json`, a generated copy of the `ui` namespace that every app ships. They never read the locales of one app.

## Helper kinds

Each helper is exactly one of these three kinds. Split a helper that does two jobs into two helpers.

| Kind      | Name starts with                                                                                        | State                                                 |
| --------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Operation | the verb of the action: `click`, `open`, `close`, `fill`, `select`, `pick`, `hover`, `reset`, `dismiss` | Can leave changed state behind                        |
| Assertion | `expect`                                                                                                | Leaves the page as it found it                        |
| Locator   | `get`                                                                                                   | Returns a `Locator`, acts on nothing, asserts nothing |

- An operation returns only once its effect landed. `selectComboboxItems` waits for the option to read selected. `resetCombobox` waits for the reset button to go. Put the wait in the helper, never in the test.
- An `expect` helper changes nothing. Two calls in a row give the same result. It never clicks, fills, hovers, or dismisses anything that the test must then undo.
- If an `expect` helper opens a popup to read it, it closes that popup again: `expectComboboxEmpty`, `expectSelectOptions`.
- If an `expect` helper reads a state that an operation holds open, it names that operation in `@remarks`: `hoverFieldInfo` then `expectFieldDescription`, `hoverTooltipTrigger` then `expectTooltip`.
- A toast takes one helper of each kind: `expectToast` reads it, `dismissToast` takes it away.

## Writing a helper

- Before you write a manual interaction sequence, look in `src/` for a helper. If a helper is missing, add it there and cover it in the `ui-samples.ts` generator.
- Give every helper a `scope` (`Page` or `Locator`) as its first parameter. Pass a narrower scope, such as a dialog or a section, when a label exists more than once on the page.
- Write a text parameter of type `TextMatch` as a tuple: `["exact", "Apple"]`, `["contains", "App"]`, or `["regex", /App/]`. Every other matcher parameter is a plain string.
- Query with `getByRole`, `getByPlaceholder` and `getByText`, in the query order of the component tests.
- A toast is a dialog with `aria-modal="false"`. `getDialog` and `getAlertDialog` drop it, so an unnamed dialog query still finds the real one.
- After a change to the helpers, run the E2E suite of every web frontend app, and make sure that all are green. A test that never ran proves nothing.
