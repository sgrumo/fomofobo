# Firebase native config

The `distribute` lanes and the `release` lanes build against **two different Firebase
projects**. Each project has its own API keys, so each has its own pair of native config
files.

```
firebase/
├── dev/    # the distribute lanes: Firebase App Distribution
│   ├── google-services.json
│   └── GoogleService-Info.plist
└── prod/   # the release lanes: App Review, Play production track
    ├── google-services.json
    └── GoogleService-Info.plist
```

`app.config.ts` points `googleServicesFile` at `firebase/prod` when `APP_ENV=prod`, and at
`firebase/dev` otherwise. `expo prebuild` copies the resolved file into the native project,
so the Firebase project a build talks to is fixed at prebuild time.

Each project registers the app under the id that environment builds:

| Project | Application id           | Register for    |
| ------- | ------------------------ | --------------- |
| dev     | `it.quinck.fomofobo.dev` | Android and iOS |
| prod    | `it.quinck.fomofobo`     | Android and iOS |

CAUTION: A config file that names a different application id makes the Android build fail.
The Google Services gradle plugin reports `No matching client found for package name`.

Google keys an OAuth client on the pair (application id, signing certificate SHA-1), and
rejects a duplicate pair even across two projects. This is why the two environments need two
application ids. See `.github/mobile-release.md`.

All four files are git-ignored: they carry API keys. Download each one from its own Firebase
project (**Project Settings > Your apps > Download**), and put it in the matching directory.

CI restores them from base64 secrets.
