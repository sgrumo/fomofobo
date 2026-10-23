See root `CLAUDE.md` for shared rules (types, patterns, shell, file structure).

## React Native + Expo

- `useEffect`/`useLayoutEffect`: architect component tree to **avoid them**; deps **ONLY** primitives or stable external values
- **NEVER** destructure props - **EXCEPTION**: wrapper components, destructure **ONLY** non-child props
- **NEVER** `React.` namespace prefix - use hooks/components directly
- PascalCase filename = PascalCase component name
- Props type: `${ComponentName}Props`
- **NO** prop spreading (`{...props}`) - **EXCEPT** in `src/components/ui/`
- Every component file must only export components or types

## UI & Styling (React Native Reusables + NativeWind v4)

- Add a component with `pnpm dlx @react-native-reusables/cli@latest add <component>`, then reorganize it into the folder structure below
- **NativeWind v4** + **Tailwind CSS v3.4.x** (**NOT** v4/v5 - incompatible with React Native Reusables)
- **NEVER** use `StyleSheet.create` for new code - use NativeWind classes
- **NO** `rem` units - RN uses density-independent pixels (plain numbers or Tailwind spacing scale)
- **NO** HTML elements (`div`, `button`, `input`) - use `View`, `Text`, `Pressable`, `TextInput`

### UI Component File Structure

Every UI component lives in its own folder under `src/components/ui/<component>/` with separated concerns:

```
src/components/ui/
└── <component>/
    ├── <component>.tsx          # Component logic and JSX
    └── <component>.styles.ts    # Variants (cva), style constants, Platform.select
```

**Rules:**

- **ALWAYS** one folder per component - **NEVER** flat files in `src/components/ui/`
- **ALWAYS** extract styles/variants to `<component>.styles.ts` - keep `.tsx` files focused on component logic
- Use `cva` from `class-variance-authority` for variant-based styles
- Use `Platform.select` for web/native differences - keep them in `.styles.ts`
- Import `cn` from `@/lib/utils/class-names` - **NEVER** from `@/lib/utils`

## Environment

- App env vars flow: `.env` -> `app.config.ts` `extra` -> `expo-constants` -> `src/lib/env.ts`
- CI/Fastlane env vars stay in `.env` only - **NOT** exposed to the app via `extra`
- `.env.template` is the source of truth for required vars

| Reads `.env`                       | How                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| Expo CLI, for `app.config.ts`      | Built in. `config/env.ts` validates the result, the only validation of `.env`    |
| Fastlane, for the lane-only values | Built in: the first of `fastlane/` and this directory that holds a `*.env*` file |
| `with-env`, for `ENV_NAME=<name>`  | Loads `.env.<name>` over `.env`                                                  |
| The app, on the device             | Never. `src/lib/env.ts` validates `extra`, which `app.config.ts` builds          |

- **NEVER** add a `*.env*` file to `fastlane/`. Fastlane then reads that folder and skips the `.env` of this directory

### Three environments: local, dev and prod

`APP_ENV` selects the environment. `config/env.ts` validates `process.env` with one Zod
schema per environment, and `config/target.ts` maps the environment to an identity.
`app.config.ts` calls both, so an invalid value fails `expo start`, `prebuild` and every
lane, never the app on first launch.

|                        | unset or `local`             | `dev`                                   | `prod`                           |
| ---------------------- | ---------------------------- | --------------------------------------- | -------------------------------- |
| `API_URL`              | defaults to `localhost:3000` | required, `https`                       | required, `https`                |
| Application id, scheme | `.dev` id, `fomofobodev`     | `.dev` id, `fomofobodev`                | store id, `fomofobo`             |
| Firebase native config | `firebase/dev/`              | `firebase/dev/`                         | `firebase/prod/`                 |
| Lanes                  | none                         | one iOS beta lane, `android distribute` | `ios release`, `android release` |

- An unrecognized `APP_ENV` fails. One variable has one name in every environment: no `_DEV`
  suffix.
- `.env` holds the local values. To point a local build at another backend, put the values in
  `.env.<name>` and run `ENV_NAME=<name> pnpm start`.
- **NEVER** set `APP_ENV` by hand for a build. The `pnpm ci:*` scripts pass it, and the lanes
  refuse a wrong value.
- Add an app var: add it to `.env.template`, to every block of `config/env.ts` with a default
  in the `local` block when a safe one exists, to `extra` in `app.config.ts`, and to
  `src/lib/env.ts`.
- dev and prod are **separate Firebase projects**. Their config files never overlap - see
  `firebase/README.md`.
- The app reads `env.appEnv`. Gate environment-dependent behaviour on it with an exhaustive
  `match`, never on `__DEV__`, which is about the JS bundle and not the target environment.

## Config stack

- The app imports `appEnvValues` from `config/target.ts`, so that file **MUST NOT** import a Node module
- Metro and Babel configs **MUST** stay `.cjs` - neither tool supports TS configs
- **NEVER** add `react-native-reanimated/plugin` to babel - Reanimated v4 includes it internally

## i18n

- `src/lib/i18n/native-i18n.ts` and `src/lib/i18n/resources.ts` **MUST NOT** import a native module. The Node tests read them
- Translations: `src/locales/${language}/${namespace}.json`, bundled with the app
- Google Sheets sync: the namespaces differ from the web apps, so this app uses its own sheet. `scripts/i18n-sheets` finds only `public/locales`, so pass the directory:
    - `pnpm -w i18n:export "$PWD/src/locales"`, from this directory
    - `pnpm -w i18n:download <spreadsheetId> "$PWD/src/locales"`, from this directory
- **NEVER** hardcode user-facing text, `accessibilityLabel` and `placeholder` included. Add a key
- Exception: a dev-only screen or control keeps plain English. The showcase button shows only when `__DEV__` is set, and the showcase route redirects to `/` in a production build
- New namespace: add one JSON file for each language. Then register the files in `src/lib/i18n/resources.ts`. If a file is not registered, `src/lib/i18n/locales.test.ts` fails
- Keys are PascalCase. A key for a list value uses the value: ``t(`Fruits.${value}`)``
- Keep the value in state, not the label. Get the label with `t()` at render
- The root `ErrorBoundary` in `src/app/_layout.tsx` holds the only copy in code, for an error before the i18n init completes. Keep it the same as `shared:AppError`
- After you add a language to `languageKeys` of the `i18n` package, run `prebuild:clean`. iOS reads the app languages from the `expo-localization` plugin in `app.config.ts`
- **NEVER** declare an Android per-app language (`supportedLocales.android`). It adds a language setting to the system settings of the app

## TanStack Query

- Call `useQuery`/`useMutation` directly at the component level, passing the exported `queryOptions`/`mutationOptions` object
- **NEVER** wrap in custom `useXxx` hooks - pass the options straight from `api`, e.g. `useQuery(api.listCategoriesQuery({ params: {}, query: {} }))`, `useMutation(api.createEventMutation)`
- Destructure returns: `{ data: entities, isLoading: entitiesLoading }`, `{ mutate: createEntity }`
- **NEVER** `query.data` or `mutation.mutate(…)` style

## API & Data

- The API layer lives in `api-client` - **ALWAYS** add endpoints to `packages/api-client/src/requests.ts`, **NEVER** hand-roll endpoints, paths or bodies in the app
- `packages/api-client/src/requests.ts` holds the **single** `createApi` function. It declares every request and every query/mutation option flat, then returns them all flat - **NO** namespaces, **NO** nesting. Every name carries the entity: `listCategoriesQuery`, `createEventMutation`
- Consume it as `api.${operation}`, e.g. `api.listCategoriesQuery(...)`, `api.deleteEventMutation` - **NEVER** re-export individual operations into app files
- AsyncStorage keys: `src/lib/storage/storage-keys.ts`. **NEVER** write a key literal at an AsyncStorage call
- Responses are validated and params/bodies typed by `api-client` from the route definitions - **NEVER** retype a body or interpolate a path by hand

## Fastlane

Each lane carries its rules and their reasons as comments in `fastlane/Fastfile`. Read them before you change a lane. `.github/mobile-release.md` holds the store and signing setup.

- Never use the CI run number as a build number. A run number counts every CI run, not the uploads.
- A change of signing key breaks the in-place upgrade on the devices of the testers.

### Ruby and gems

- `.ruby-version` holds the exact release, and it must match the release that the `android-builder` image ships.
- Every direct gem carries an exact version, in the `Gemfile` and in `fastlane/Pluginfile`. This is the whole drift policy. A `lockFileMaintenance` refresh then moves transitive gems only. The `Gemfile` comments carry the `:ios` constraints.
- CI installs the gems in frozen mode. If the `Gemfile` and `Gemfile.lock` disagree, the job fails with `the lockfile can't be updated because frozen mode is set`.
- `Gemfile.lock` locks `arm64-darwin`, `ruby` and `x86_64-linux`. The Darwin entry carries no OS version. For a new runner platform, run `bundle lock --add-platform <platform>`.
- The shared Renovate config disables the `bundler` manager. Only a `lockFileMaintenance` refresh and a security advisory reach the gem files. Both build through `android-build` and `ios-build` first.

## Accessibility

Every new component and screen must comply with these rules. Non-compliance will cause App Store / Play Store rejection.

### Screen Reader Support (VoiceOver / TalkBack)

- Every `Pressable` must have `accessibilityRole` and `accessibilityLabel`. Icon-only buttons must always have a label (e.g. `accessibilityLabel={t("Back")}`).
- `Image` components with meaningful content must have `accessibilityLabel`. Decorative images can omit it.
- Screen/section titles must use `accessibilityRole="header"` on the `Text` element.
- Modal content containers must use `accessibilityRole="alert"` (error dialogs) or label close buttons with `accessibilityLabel={t("Close")}`.
- Error messages must use `accessibilityLiveRegion="polite"` so screen readers announce them.
- Use `aria-invalid={!!error}` on an input when validation fails (not `accessibilityState={{ error }}`).

### Touch Targets

- Minimum **44x44 pt** for all interactive elements (iOS requirement). Android recommends 48dp.
- If the visual element is smaller (e.g. an icon), use padding or `hitSlop` to reach the minimum.

### Color Contrast (WCAG 2.2 AA)

- Normal text on background: **4.5:1** minimum contrast ratio.
- Large text (18pt+ or 14pt+ bold) and UI components: **3:1** minimum.
- Never hardcode a color. Use the theme colors of `tailwind.config.cjs`.

### Font Sizes

- Minimum font size: **10pt**. Prefer 12pt+ for body content.
- Do not set `allowFontScaling={false}` unless absolutely necessary (e.g. fixed-size badge).
- Use `maxFontSizeMultiplier={1.5}` on constrained layouts (tab bar, badges, counters) to prevent overflow.

### Color-Only Indicators

- Never rely solely on color to convey meaning (e.g. win/loss, unread state). Always pair with text, icon, or shape.
