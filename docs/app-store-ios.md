# iOS App Store (EAS)

Ping is an Expo SDK 57 app (display name **Ping**, slug `chaptr`, scheme `ping`). Store identifiers live in `app.json`:

| Field | Value |
| --- | --- |
| iOS bundle identifier | `sg.ping.app` |
| Android package | `sg.ping.app` |
| User-facing version | `expo.version` (`1.0.0`) |
| iOS build number | `ios.buildNumber` (`"1"`) |
| Android version code | `android.versionCode` (`1`) |

Icon (`assets/images/icon.png`, 1024×1024) and the splash screen (`expo-splash-screen` plugin) are already set. `eas.json` uses the current EAS profile defaults: `development` and `preview` are internal distribution, `production` is store distribution (App Store / TestFlight). Versions are read from `app.json` (`cli.appVersionSource` is `local`).

The `development` profile does **not** set `developmentClient`. This repo does not depend on `expo-dev-client`. To opt in later, install that package and set `"developmentClient": true` on the `development` profile.

No Apple ID, App Store Connect API key, certificate, or provisioning profile is stored in this repo. Do not add those to CI. The first build and submit are interactive on a developer machine.

## Before the first build

1. An [Apple Developer Program](https://developer.apple.com/programs/) membership for the team that will own `sg.ping.app`.
2. An [Expo account](https://expo.dev/signup).

## Commands

From the repo root, on your machine:

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build -p ios --profile production
npx eas-cli submit -p ios
```

- `eas-cli login` signs in to Expo. It does not store a token in git.
- `build:configure` is only needed if `eas.json` is missing or you want EAS to link this repo to an Expo project. It may write `extra.eas.projectId` into `app.json`. That id is not a secret; commit it. Skip the command when `eas.json` is already present and you will link the project on the first build.
- `build -p ios --profile production` creates the App Store `.ipa`. The first run asks you to sign in with your Apple ID and lets EAS create the distribution certificate and provisioning profile. Those credentials stay on EAS, not in this repository.
- `submit -p ios` uploads the finished production build to App Store Connect. After Apple processes it (often 10–15 minutes), it shows up in TestFlight. Release to the App Store from App Store Connect when you are ready.

`preview` builds are internal (ad hoc) installs for teammates. They are not the TestFlight upload. Use `production`, then `eas submit`, for TestFlight.

Bump `ios.buildNumber` (string) before each new iOS upload, and `android.versionCode` (integer) before each Play upload. Bump `expo.version` when the user-facing version changes. Duplicate build numbers are rejected by App Store Connect.
