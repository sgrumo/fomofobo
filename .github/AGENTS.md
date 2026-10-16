# Workflows

## Structure

- The entry workflows are `ci.yaml` on every pull request and push, `cache-cleanup.yaml` on a closed pull request, and, with the mobile app, `mobile-dev-release.yaml` and `mobile-store-release.yaml` on manual dispatch. Every other workflow is reusable and only `workflow_call` reaches it.
- A deploy is a job of an entry workflow. In `ci.yaml`, it needs `quality` and `resolve-env`, and runs only when `resolve-env` maps the branch to an environment. A deploy that a project does not use yet stays a commented drop-in.
- `resolve-env` in `ci.yaml` is the only map from branch to deploy environment. Each deploy takes the result as its `environment` input and as its GitHub environment.
- `mobile-dev-release.yaml` ships a tester build from any branch, and `mobile-store-release.yaml` ships a store release from `main`. Both ship only a commit that passed quality. `ci-gate.yaml` reads the jobs of the `ci.yaml` run whose names start with `quality / `, so keep the name of the `quality` job in `ci.yaml`. When no `ci.yaml` run checked the commit, the release calls `quality.yaml` itself, so its `permissions` match those of `ci.yaml`.
- Never trigger a workflow on a tag push. `mobile-store-release.yaml` creates the `v<version>` tag after the stores accept the build.
- `quality.yaml` takes no inputs. To scope it to a repository, remove the jobs that the repository has no code for. Do not gate them.
- Each workflow declares its own `runs-on`. A job runs on a GitHub-hosted `ubuntu-latest` runner, unless it needs another host, such as macOS for an iOS build.

## Secrets and variables

- A reusable workflow declares every secret that it reads under `on.workflow_call.secrets`.
- A deploy job passes `secrets: inherit`, so its job reads the secrets of its GitHub environment. Every other caller passes each secret by name.
- Give a secret a `description` only for a fact that its name does not show.
- A workflow reads a variable as `vars.X`. Add no list of variables anywhere.
- `infra/AGENTS.md` holds the rule that decides secret or variable.

## Test reports

- Every test run writes its reports to `.ignored/tests/`. Each test job uploads them as a `junit-*` artifact, with `include-hidden-files: true` because `.ignored/` is hidden.
- The upload and download steps set `continue-on-error: true`. If the artifact quota of the organization is full, the test jobs keep their own result.
- `test-report` publishes one `Test Report` check run and does not fail on a failed test: the test jobs fail on their own. If you add a test job, add it to `test-report.needs` and upload its reports as a `junit-*` artifact.
- Each E2E job calls `quality-e2e.yaml` with the directory of its suite. The suite builds the apps it drives, so the job has no build step. A browser suite sets `browser: true` and runs in the Playwright image.
- A suite whose app signs visitors in starts `mock-oauth2-server` on a mapped port. The lifecycle publishes its issuer, so the app, the browser and the test workers use the same URL.

## Native builds

- `android-build` and `ios-build` build the release variant, because the debug variant skips JS bundling and hides a broken bundle until deploy time.
- A `native-changes` paths filter gates them. A TS-only change skips both. Do not force them on an event: a beta or a release compiles the app itself.
- `ios-build` and the iOS deploys share a `concurrency` group keyed on the repository, because one macOS host serves them with no container. GitHub holds one pending entry per group and cancels the previous one, so the second of three concurrent builds is cancelled.
- Every iOS job starts with the `setup-mobile-ios` action, and every Android job with `setup-mobile-android`. They export the job environment that the gems and the lanes read, so a new mobile job uses them too.
- `setup-mobile-ios` checks the Xcode major version and the free disk first, and fails with the required value in the message.
- An iOS job that runs a gym lane ends with `print-xcodebuild-log` under `if: failure()`. fastlane filters the xcodebuild output, so the job log does not show the error otherwise.

## Caches

- The Android jobs mount the named Docker volume `gradle-cache` at `/root/.gradle` and set `GRADLE_USER_HOME`. Never use `actions/cache` for Gradle: in a container job `~` is `/github/home`, so a step keyed on `~/.gradle` archives an empty directory.
- The volume belongs to the host, and the Android jobs of other repositories on that host share it. Gradle's own locks do not work across containers, and two concurrent jobs fail with `Timeout waiting to lock journal cache`.
- So every job that mounts the volume runs Gradle under `flock "$GRADLE_LOCK"` (`/root/.gradle/ci-job.lock`), with `GRADLE_OPTS: -Dorg.gradle.daemon=false`. An idle daemon keeps the cache locks after `flock` releases. A `concurrency` group does not replace the lock.
- `ruby/setup-ruby` is the only step that writes a GitHub cache. `cache-cleanup.yaml` deletes the caches of `refs/pull/<n>/merge`, because a `pull_request` run writes there and not to the branch.

## Runner disk

GitHub discards each hosted runner after its job, so a workflow leaves no state on a host.
