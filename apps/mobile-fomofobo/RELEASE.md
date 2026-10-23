# Mobile release

A person builds and ships the app by hand on a Mac, with the Fastlane lanes of this directory. `README.md` lists the lanes and the channel that each one reaches.

Run every command of this file from the directory of the app.

## One-time setup

### The Mac

1. Install Xcode from the App Store.
2. Run `sudo xcode-select -s /Applications/Xcode.app`.
3. Install the JDK and the Android SDK, as `SETUP.md` says.
4. Install `libyaml` and `gmp` with `brew`. The native extensions of the gems need them.
5. Install the Ruby release of `.ruby-version` with a version manager, for example `rbenv` or `mise`.
6. Run `bundle install`.
7. Copy `.env.template` to `.env`.
8. Write `API_URL=https://fomofobo-dev.vercel.app` in `.env.dev`, and the production `API_URL` in `.env.prod`.

The Mac is ready when `bundle exec fastlane --version` prints the version that the `Gemfile` pins.

If `bundle install` fails on an Intel Mac, run `bundle lock --add-platform x86_64-darwin` first, and commit the lock.

### Where each secret lives

Keep every key file in one folder outside the repository, for example `~/.config/fomofobo-release/`. Keep a copy of each file and each password in your password manager.

| Value                                 | Kind                        | Comes from                        |
| ------------------------------------- | --------------------------- | --------------------------------- |
| `APP_STORE_CONNECT_API_*`             | `.p8` file                  | [Apple](#apple)                   |
| `APPLE_TEAM_ID`                       | id                          | [Apple](#apple)                   |
| `MATCH_GIT_URL`, `MATCH_PASSWORD`     | URL, secret                 | [Match](#match-repository)        |
| `ANDROID_KEYSTORE_*`, `ANDROID_KEY_*` | keystore                    | [Android](#android)               |
| `GOOGLE_PLAY_JSON_KEY_PATH`           | JSON file                   | [Android](#android)               |
| `FIREBASE_*`                          | ids, group alias, JSON file | [Firebase](#firebase-dev-project) |

The values go in `.env`. A `*_PATH` value is the absolute path of the file. `.env.dev` and `.env.prod` hold `API_URL` alone.

### Apple

1. In [App Store Connect](https://appstoreconnect.apple.com/access/integrations/api), create an API key with the Admin role.
2. Download the `.p8` file. Apple lets you download it once.
3. Write its key ID, the issuer ID and the path of the file in the `APP_STORE_CONNECT_API_*` values.
4. Write `APPLE_TEAM_ID` from [developer.apple.com/account](https://developer.apple.com/account), under Membership details.
5. Under Certificates, Identifiers & Profiles, register the identifiers `it.quinck.fomofobo` and `it.quinck.fomofobo.dev`. Match creates no App ID.
6. In App Store Connect, create the app record of `it.quinck.fomofobo`. The dev id needs no record.

The first `certificates` run creates the distribution certificate, and that needs the Admin role. After it, you can replace the key with one of the App Manager role.

### Match repository

Match keeps the signing certificate and the profiles, encrypted, in a git repository.

1. Create an empty private GitHub repository, for example `fomofobo-certificates`.
2. Write its SSH URL in `MATCH_GIT_URL`. The Mac reaches it with its own SSH key.
3. Choose a `MATCH_PASSWORD`. Match encrypts the repository with it.
4. Add the UDID of each tester iPhone to `fastlane/devices.txt`, as the comments of that file say.
5. Run `bundle exec fastlane ios certificates`.

The setup is done when the repository holds one certificate, an appstore profile of `it.quinck.fomofobo` and an ad-hoc profile of `it.quinck.fomofobo.dev`.

CAUTION: Never run `fastlane match nuke distribution`. It revokes every distribution certificate of the team.

CAUTION: Renew the certificate before its end date. `match` refuses an expired certificate, even with `readonly: true`, and every build stops.

### Firebase (dev project)

The dev builds reach the testers through Firebase App Distribution. A production build never goes to Firebase, so a prod project is not necessary.

1. In the [Firebase console](https://console.firebase.google.com/), create a project, for example `fomofobo-dev`. The free Spark plan covers App Distribution.
2. Add an iOS app with the bundle id `it.quinck.fomofobo.dev`, and an Android app with the package name `it.quinck.fomofobo.dev`. The app has no Firebase SDK, so it needs no config file.
3. Write the App ID of each app in `FIREBASE_IOS_APP_ID` and `FIREBASE_ANDROID_APP_ID`.
4. In the Google Cloud console of the same project, create a service account with the Firebase App Distribution Admin role.
5. Download its JSON key.
6. Write the path of the key in `FIREBASE_SERVICE_ACCOUNT_JSON_PATH`.
7. Under App Distribution > Testers & groups, create a group with the alias `internal`.
8. Add the tester emails to the group.

### Android

1. Generate the release keystore, outside the repository:

    ```sh
    keytool -genkey -v -keystore fomofobo-release.keystore -alias fomofobo \
      -keyalg RSA -keysize 2048 -validity 10000
    ```

2. Write its path, its alias and both passwords in the `ANDROID_KEYSTORE_*` and `ANDROID_KEY_*` values.
3. In the [Play Console](https://play.google.com/console), create the app with the package name `it.quinck.fomofobo`.
4. Keep Play App Signing on.
5. In Google Cloud, create a service account.
6. Enable the Google Play Android Developer API in the project of the service account.
7. Download its JSON key.
8. Write the path of the key in `GOOGLE_PLAY_JSON_KEY_PATH`.
9. In the Play Console, under Users and permissions, invite the email of the service account with permission to release.

CAUTION: Keep a copy of the keystore and its passwords. If you lose them, every tester must uninstall the app before the next build installs.

The Play API cannot create the first release. To upload it by hand:

1. Run `APP_VERSION=1.0.0 pnpm release:android:store`. The lane builds the bundle, then the upload fails.
2. Upload `android/app/build/outputs/bundle/release/app-release.aab` to a closed testing track in the Play Console.

If the Play account is a personal account created after 2023-11-13, Google opens the production track only after a closed test. The test needs at least 12 testers, opted in for 14 days in a row. Then apply for production access in the Play Console. Until then, `release:android:store` fails at the upload.

### Store listings

Each store asks for these before the first submission. Fill them by hand: the lanes never upload metadata.

- Name, short and full description, in Italian.
- Screenshots of each required device size.
- The URL of the privacy policy and a support URL.
- Category, age rating (App Store) and content rating (Play).
- The privacy answers below.

The app has no account, no ads and no tracking. It sends these data to the API:

| Data      | What it is                                                                                            | App Store privacy label                                                                   | Play data safety                                              |
| --------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Device id | A random id that the app makes on the device. Each save and unsave sends it, for the interested count | Identifiers > Device ID: not linked to the user, not used for tracking, App Functionality | Device or other IDs: collected, not shared, App functionality |
| Location  | The phone location, while the app is in use, to center the map                                        | Declare it only if a build sends it to the API                                            | Same rule                                                     |

The `ios release` lane answers the export compliance question: the app uses HTTPS alone, so the lane declares no encryption.

## Add a tester

Android: add the email to the `internal` group of App Distribution. The tester accepts the invite once.

iOS installs an ad-hoc build only on a device that its profile names:

1. Read the UDID from Xcode > Window > Devices and Simulators.
2. Add a `UDID<tab>Name` row under the header of `fastlane/devices.txt`, with a tab and no spaces.
3. Run `bundle exec fastlane ios certificates`. It registers the device and rebuilds the profile.
4. Ship a new tester build. An earlier build never installs on the new device.

Apple caps the registered iPhones at 100 for each membership year.

## Ship a tester build

The lane builds the files of the directory as they are, uncommitted changes included.

1. Check out the commit to ship, with a clean working tree.
2. Run `pnpm release:ios:distribute`.
3. Run `pnpm release:android:distribute`.

To send notes with the build, prefix the command with `FIREBASE_RELEASE_NOTES="<text>"`.

The build is out when the testers of the `internal` group get the App Distribution email.

## Ship a store release

1. Test the App Distribution build of the same commit. That build talks to dev.
2. Fill "What's New" of the new version in App Store Connect. App Review rejects a new version with empty notes.
3. For Android, write the notes in `fastlane/metadata/android/it-IT/changelogs/<version-code>.txt`. The version code is the highest code on Play plus one. Without the file, the release has no notes.
4. Run `APP_VERSION=x.y.z pnpm release:ios:store`.
5. Run `APP_VERSION=x.y.z pnpm release:android:store`.
6. If the release goes with an API change that breaks old builds, follow "Release a breaking change" in `infra/vercel/mobile-version-gate.md`.
7. Otherwise, when a store serves the build, set `*_CURRENT_VERSION` of that platform, as that file says.

The iOS lane submits the build to App Review. The Android lane releases the bundle to the production track at once.

The store release rebuilds the commit against production, so it is a different build from the one that the testers used.

## Ruby and gems

To see what the pins hold back, run `bundle outdated`.

To move a gem:

1. Edit its exact version in the `Gemfile` or in `fastlane/Pluginfile`.
2. Run `bundle install`.
3. Commit the edited file with `Gemfile.lock`.

To move to a new Ruby release:

1. Write the release in `.ruby-version`.
2. Install it with your version manager.
3. Run `bundle lock` to refresh `RUBY VERSION` in `Gemfile.lock`.
4. Run `bundle install`.
5. Commit `.ruby-version` and `Gemfile.lock`.
