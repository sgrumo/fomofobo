See root `CLAUDE.md` for shared rules (types, patterns, shell, file structure).

A live showcase of every `ui-components` primitive. Apps mount it on a dev-only route, for example
`/dev/showcase/`: `import { ComponentsShowcase } from "components-showcase"`.

The package holds no app state, no i18n, and no API calls. It renders the primitives with local
state only, so it works in any app that provides the `ui-components` providers.

## Structure

- `src/index.ts` - the only entry point. It exports `ComponentsShowcase`.
- `src/components-showcase.tsx` - the grid page. It renders one `ShowcaseSection` per primitive.
- `src/<component>-showcase.tsx` - one file per primitive, one exported `<Component>Showcase`.
- `src/components-showcase.helper.ts` - shared demo data and shared types.
- `src/form-errors-showcase.*` - one field per `FormIssueKey`, plus the sample schemas that raise
  each key. The test asserts that every field raises its own key.

## Rules

- One file per primitive. The file name matches the `ui-components` export: `button-showcase.tsx`
  shows `ui-components/button`.
- The exported component is `<Component>Showcase`. Its props type is `<Component>ShowcaseProps`.
- Register every new file in `src/components-showcase.tsx`. A showcase that nobody renders is dead
  code.
- App-specific parts arrive as props. `ComponentsShowcase` takes the `errorBoundary` component and
  the `parseFormState` parser from the host app.
- `parseFormState` is a `FormStateParser` from `src/components-showcase.helper.ts`. The app binds
  its own language and error map to it, so the form errors render in the language of the app.
- The showcase is dev-only. Each app gates the route with its own dev check, so a production
  deploy never serves it.
