# Dev machine setup

One-time setup to build and run the app on a physical device. If your machine is already configured, all you need is `pnpm android` / `pnpm ios` from the directory of the app.

Hardware features (camera, sensors, push) only exist on physical devices — prefer them over emulators/simulators.

## Android (Linux or macOS)

### 1. JDK (not just a JRE)

Gradle needs `javac`. A JRE alone fails with `No Java compiler found, please ensure you are running Gradle with a JDK`. Any OpenJDK 17–21 works with AGP 8:

```sh
sudo apt install openjdk-21-jdk        # Debian/Ubuntu
sudo dnf install java-21-openjdk-devel # Fedora
sudo pacman -S jdk21-openjdk           # Arch
brew install openjdk@21                # macOS
```

**Gotcha**: if a Gradle build already ran before you installed the JDK, a stale daemon keeps the old JRE-only view and fails with the same error. Kill it:

```sh
cd android && ./gradlew --stop   # from the directory of the app
```

### 2. Android SDK (user-local, no root)

Install the [command-line tools](https://developer.android.com/studio#command-line-tools-only) into `~/Android/Sdk` and let `sdkmanager` pull the components the project needs (on macOS grab the `commandlinetools-mac-*.zip` variant instead). The versions below match Expo SDK 57 / RN 0.86 — bump them as the template upgrades:

```sh
mkdir -p ~/Android/Sdk/cmdline-tools
cd /tmp && curl -sSLO https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip
unzip -q commandlinetools-linux-13114758_latest.zip && mv cmdline-tools ~/Android/Sdk/cmdline-tools/latest

export ANDROID_HOME="$HOME/Android/Sdk"
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \
    "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"
```

Then make it permanent in your shell rc:

```sh
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Do **not** install the SDK itself from distro/community packages (a root-owned `/opt/android-sdk` fights Gradle's auto-downloads and pins the wrong versions), and do **not** install your distro's standalone adb package (`android-tools`) alongside it — two different `adb` versions kill each other's server.

### 3. Device access (udev + USB debugging)

Linux needs udev rules so adb can talk to the phone without root (macOS doesn't):

```sh
sudo apt install android-sdk-platform-tools-common # Debian/Ubuntu
sudo pacman -S android-udev                        # Arch
# other distros: https://github.com/M0Rf30/android-udev-rules
```

On the phone: Settings > About phone > tap **Build number** 7× to unlock Developer options, then enable **USB debugging**. Plug in, accept the **"Allow USB debugging?"** dialog (tick "Always allow"). Verify:

```sh
adb devices   # must say "device", not "unauthorized" (dialog pending) or nothing (udev/cable)
```

If the phone shows up in `lsusb` as MTP but `adb devices` lists nothing, USB debugging is off on the phone. Runtime permissions (camera, etc.) can also be denied silently by Android once in "never ask again" state — the app must handle it by linking to system settings.

### 4. Run it

```sh
pnpm android   # from the directory of the app; first build takes several minutes
```

Keep the terminal open afterwards — it's the Metro dev server.

## iOS (macOS only)

1. **Xcode** from the App Store (not just Command Line Tools — the simulator SDKs and build toolchain come with the full app), then:

    ```sh
    sudo xcode-select -s /Applications/Xcode.app
    sudo xcodebuild -license accept
    ```

2. **CocoaPods** (`expo run:ios` invokes it during prebuild):

    ```sh
    brew install cocoapods
    ```

    CocoaPods needs a UTF-8 locale. If `pod install` fails with `Unicode Normalization not appropriate for ASCII-8BIT`, put this in your shell rc:

    ```sh
    export LANG=en_US.UTF-8
    ```

3. **Physical iPhone**:
    - Free or paid Apple Developer account added to Xcode (Settings > Accounts); on first build failure open `ios/*.xcworkspace` of the app and pick your Team under Signing & Capabilities.
    - On the phone (iOS 16+): Settings > Privacy & Security > **Developer Mode** on, then trust the developer certificate when prompted (Settings > General > VPN & Device Management).

4. **Run it**:

    ```sh
    pnpm ios   # from the directory of the app
    ```
