fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios certificates

```sh
[bundle exec] fastlane ios certificates
```

Sync signing assets via match - the tester profile follows the beta channel

### ios distribute

```sh
[bundle exec] fastlane ios distribute
```

Build an ad-hoc ipa and hand it to internal testers via Firebase App Distribution (dev environment)

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Build the dev app and hand it to internal testers on TestFlight (dev environment)

### ios release

```sh
[bundle exec] fastlane ios release
```

Build and submit to App Review (production) - no TestFlight distribution

---

## Android

### android release

```sh
[bundle exec] fastlane android release
```

Build and release to the Play Store production track (production)

### android distribute

```sh
[bundle exec] fastlane android distribute
```

Build a signed release APK and hand it to internal testers via Firebase App Distribution (dev environment)

---

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
