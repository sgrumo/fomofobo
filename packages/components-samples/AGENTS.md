See root `CLAUDE.md` for shared rules (types, patterns, shell, file structure).

A page of `ui-components` primitives with props tuned for the frontend E2E suites. Apps mount it
on a dev-only route, for example `/dev/samples/`:
`import { ComponentsSamples } from "components-samples"`.

The package holds no app state, no i18n, and no API calls. It renders the primitives with local
state only, so it works in any app that provides the `ui-components` providers.

## Structure

- `src/index.ts` - the only entry point. It exports `ComponentsSamples`.
- `src/components-samples.tsx` - the page. It renders one `SamplesSection` per primitive.
- `src/<component>-samples.tsx` - one file per primitive, one exported `<Component>Samples`.
- `src/components-samples.helper.ts` - shared demo data and shared types.

## Rules

- One file per primitive. The file name matches the `ui-components` export: `button-samples.tsx` shows `ui-components/button`.
- The exported component is `<Component>Samples`.
- Register every new file in `src/components-samples.tsx`. A sample that nobody renders is dead code.
- Every visible label, button name, title, and placeholder must be unique across the page. The shared helper tests in `e2e/ui-components` match these strings verbatim - do not change them without an update to those tests.
- The page is dev-only. Each app gates the route with its own dev check, so a production deploy never serves it.
