# Mobile app

Expo app of fomofobo: the public features of the web app, with no sign-in. It calls the Hono API that `apps/fullstack-fomofobo` serves under `/api/*`.

## Running the App

First time on this machine? See [SETUP.md](./SETUP.md) for the one-time toolchain setup (JDK, Android SDK, device access, Xcode).

Copy `.env.template` to `.env` and fill it in. The Fastlane values are not exposed to the app. Locally, the `*_PATH` values point at the key files.

From the repo root, start the API with `pnpm dev:fomofobo`, then run `pnpm dev:mobile:ios` or `pnpm dev:mobile:android`.

## Release channels

A lane builds against one of two environments, `dev` or `prod`. `APP_ENV` selects it, and `app.config.ts` keys every environment-dependent value off that one variable. Unset, it builds a `local` app with the dev identity.

| Lane                 | Channel                   | Application id           | Reaches    |
| -------------------- | ------------------------- | ------------------------ | ---------- |
| `ios distribute`     | Firebase App Distribution | `it.quinck.fomofobo.dev` | testers    |
| `android distribute` | Firebase App Distribution | `it.quinck.fomofobo.dev` | testers    |
| `ios release`        | App Review                | `it.quinck.fomofobo`     | real users |
| `android release`    | Play production track     | `it.quinck.fomofobo`     | real users |

The dev build carries its own application id, so both apps install side by side. No workflow runs the lanes: a person runs them by hand on a Mac.

An iOS tester costs a UDID in `fastlane/devices.txt`, a `certificates` rerun and a fresh build, with a cap of 100 devices per membership year. Android always uses App Distribution: the `.dev` package has no Play listing.

Run the lanes through the pnpm scripts, which pass `APP_ENV`. Never set `APP_ENV` by hand.

```sh
pnpm release:ios:distribute
pnpm release:android:distribute
pnpm release:ios:store
pnpm release:android:store
```
