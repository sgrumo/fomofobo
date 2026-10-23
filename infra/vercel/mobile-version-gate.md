# Mobile version gate

The mobile app and the API deploy on different clocks. A store approves a release hours or days after the API reaches production. So old app builds call a newer API.

The app asks `GET /api/client-compatibility` at every start, and again at an interval while a blocking screen shows. The API answers with one action:

| Action            | Condition                                    | The user sees                         |
| ----------------- | -------------------------------------------- | ------------------------------------- |
| `ok`              | The version is current                       | Nothing                               |
| `update-optional` | `MIN` <= version < `CURRENT`                 | A dismissible popup with a store link |
| `update-required` | version < `MIN`, and `RELEASE_LIVE` is true  | A blocking screen with a store link   |
| `maintenance`     | version < `MIN`, and `RELEASE_LIVE` is false | A blocking screen, and no link        |

A store link is useless while the store holds nothing to install. That is the reason for the maintenance state. Each platform holds its own values, so a late iOS release never blocks a working Android release. The service is `apps/fullstack-fomofobo/src/server/services/client-compatibility-service.ts`.

## Variables

Each platform reads four variables, with the prefix `IOS_` or `ANDROID_`:

| Variable          | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| `MIN_VERSION`     | Lowest build that works with the API                    |
| `CURRENT_VERSION` | Build in the store                                      |
| `RELEASE_LIVE`    | `true` when the store serves the build of `MIN_VERSION` |
| `STORE_URL`       | Link that the update button opens                       |

With nothing set, the gate sleeps and every request gets `ok`. An absent `*_RELEASE_LIVE` reads as `true`, so a forgotten value never strands a user on a maintenance screen. An absent `*_STORE_URL` turns a block into `maintenance` and an optional update into `ok`.

A version must be full `semver`: `1.4.0` is valid and `1.4` is not. A wrong value stops the boot of the API. A build with no `APP_VERSION`, such as a local build, reports `1.0.0`.

`IOS_STORE_URL` needs the numeric App Store id from App Store Connect: `https://apps.apple.com/app/id<number>`. The bundle identifier does not work. `ANDROID_STORE_URL` is `market://details?id=it.quinck.fomofobo`.

Set `*_MIN_VERSION` only for a change that breaks an old build. An additive change of the API needs nothing here.

## Change a value

Every value is configuration, never a credential. It lives in `env/<env>.env` of this folder, where each variable waits as a commented line. Remove the `#`, write the value, and merge the file. The next deploy writes the value into the Vercel project.

If you comment a line out or delete it, the old value stays in the Vercel project. To stop a gate, set a value that blocks nobody: `*_MIN_VERSION=0.0.0` and `*_CURRENT_VERSION=0.0.0`.

## Release a breaking change

1. Set `*_MIN_VERSION` to the new version, and set `*_RELEASE_LIVE` to `false`. Do both in one commit, and deploy it with the API.
2. Submit the app to both stores.
3. When a store approves the release, set `*_RELEASE_LIVE` of that platform to `true`, and deploy. Its blocked users then get a store link in place of the maintenance screen.
4. Set `*_CURRENT_VERSION` to the new version, and deploy. Users above `MIN` then get the dismissible popup.

The release is done when both platforms have `*_RELEASE_LIVE=true` and `*_CURRENT_VERSION` equal to the new version.

If `*_RELEASE_LIVE` stays `false` after the store approval, users stay on a maintenance screen while the update exists in the store. Put step 3 next to the store release step of the release checklist.
