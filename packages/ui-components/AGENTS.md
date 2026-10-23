See root `CLAUDE.md` for shared rules (types, patterns, shell, file structure).

Headless, app-agnostic React UI primitives built on `@base-ui/react`. Consumed by apps via the per-component `exports` map: `import { Button } from "ui-components/button"`.

## Components

**Form & inputs**

- `field` - label / description / error wrapper + context shared by form controls
- `form` - form context + submission wiring
- `input` - low-level text input primitive
- `string-input` - single-line text field
- `textarea` - multi-line text field
- `number-input` - numeric field with spin controls
- `password-input` - text field with show/hide toggle
- `otp-input` - one-time-code field with one input per character
- `date-input` - date entry field
- `time-input` - time entry field
- `day-picker` - calendar day-selection grid
- `checkbox` - boolean checkbox
- `radio` - radio group
- `switch` - on/off switch
- `toggle` - toggle button + button-toggle group
- `select` - single-select dropdown
- `combobox` - searchable single/multi select with chips
- `autocomplete` - text input with suggestion list
- `search-field` - search input with a leading icon, a block cursor placeholder and a clear button
- `slider` - range slider
- `stepper` - multi-step navigation/progress

**Actions & overlays**

- `button` - button primitive (variants/sizes)
- `icon-button` - round icon-only button, `aria-label` required by type
- `chip` - toggle with an icon, a label and a count, plus `ChipRow`, a scrolling labelled group
- `dialog` - modal dialog
- `alert-dialog` - confirmation dialog (+ typed-text "type to confirm" variant)
- `drawer` - edge-anchored sheet
- `bottom-sheet` - non-modal drawer from the bottom edge with a grab handle
- `popover` - floating panel anchored to a trigger
- `tooltip` - hover/focus hint
- `menu` - dropdown menu
- `context-menu` - right-click menu

**Layout & disclosure**

- `accordion` - multiple expandable sections
- `collapsible` - single collapsible region
- `tabs` - tabbed panels
- `separator` - divider line
- `table` - data-table primitives

**Feedback & status**

- `alert` - inline alert banner
- `toast` - transient notifications (manager + provider + hooks)
- `progress` - progress bar
- `tick-progress` - tick-mark progressbar with a value text
- `timeline` - `tick-progress` with start, now and end labels
- `meter` - gauge/meter
- `spinner` - loading spinner
- `fallback-box` - empty/error placeholder box

**Display & navigation**

- `avatar` - user avatar
- `badge` - filled tag with an optional leading square dot
- `stat-grid` - outlined grid of label and value cells
- `pagination` - page navigation
- `icons` - SVG icon component set
- `pixel-icons` - pixel icon set on a 12 x 12 grid, one component per icon, plus `PixelIcon`, which takes the icon name. The bitmaps live in `domain/pixel-icons`, which the native app and the Node scripts read with no React

**Infrastructure (non-component exports)**

- `provider` - `UiProvider`: single entry point a consumer mounts once - injects the translate fn (`i18n.t`) + `isDev` flag via context **and** wraps the package's required providers (tooltip, toast); the consumer passes in the `toastManager`. Consider that some components (`combobox`, `alert-confirmation-dialog`) use TanStack Query hooks, so the consuming app must also mount a `QueryClientProvider` somewhere above (`@tanstack/react-query` is a peer dep)
- `i18n` - `UiContext`/`useUiContext` + translation key map & `UiTranslate` type
- `styling` - `cn`-based class helpers + base-ui styling normalization

## Conventions

- **No app coupling**: nothing here imports from an app. Cross-package utils come from `frontend-shared`, `react-shared`, or `shared`. The pixel icon bitmaps come from `domain`.
- **i18n**: components **NEVER** hardcode user-facing text. Read the translate fn via `const { i18n } = useUiContext()` then call `i18n.t(key, params)`; the consuming app supplies it through `UiProvider`. Declare every key (with its interpolation params) in `i18n/ui-translations.ts` (`UiInterpolations`).
- **Prop spreading is allowed** here - these are primitives that forward native props.
- **Folder layout** per component: `index.ts` (barrel), `<name>.tsx`, optional `<name>.styles.ts` / `<name>.helper.ts` / `<name>.context.ts`, `<name>.test.tsx`. Add the entry to `package.json` `exports`.

## Component Testing (React Testing Library)

_"The more your tests resemble the way your software is used, the more confidence they can give you."_

- vitest + jsdom; `render` from `src/test/test-utils` wraps nodes in `TestProviders` (real `UiProvider`/toast/tooltip/query providers)
- Test through end-users (rendered output) and developers (props) **ONLY**
- **NEVER** test implementation details (internal state, methods, lifecycle, child internals)
- Props are developer API - testing prop behavior is valid
- Real providers (e.g., `Field`), **NOT** `SomeContext.Provider`
- Query priority: `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByDisplayValue` > `getByAltText` > `getByTitle` > `getByTestId` (last resort)
- Interact like a user: click, type, read visible text
- Tests must survive refactors
