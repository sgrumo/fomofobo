# Firebase native config

The app has no Firebase SDK, so no build needs a file of this folder. Firebase App
Distribution ships the dev builds with the values of `.env` alone. See `RELEASE.md`.

If a Firebase SDK joins the app, each environment reads its own pair of files from its own
Firebase project:

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
`firebase/dev` otherwise. It leaves the key out when the file is missing. `expo prebuild`
copies the resolved file into the native project, so the Firebase project a build talks to
is fixed at prebuild time.

Each project registers the app under the id that environment builds:

| Project | Application id           | Register for    |
| ------- | ------------------------ | --------------- |
| dev     | `it.quinck.fomofobo.dev` | Android and iOS |
| prod    | `it.quinck.fomofobo`     | Android and iOS |

CAUTION: A config file that names a different application id makes the Android build fail.
The Google Services gradle plugin reports `No matching client found for package name`.

All four files are git-ignored: they carry API keys. Download each one from its own Firebase
project (**Project Settings > Your apps > Download**), and put it in the matching directory.
