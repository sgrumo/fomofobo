# CI/CD

`ci.yaml` runs `quality.yaml` on every pull request and push, and then the
deploys of the branch. Each deploy needs `quality`, so a deploy cannot start
unless quality passed.

A project with the mobile app also has two workflows that run on manual dispatch:

- `mobile-dev-release.yaml` sends a dev build of any branch to the testers.
- `mobile-store-release.yaml` submits a production build of `main` to the stores.

Both reuse the `ci.yaml` run of the commit, so quality does not run a second time.
[`mobile-release.md`](mobile-release.md) says how to run them.

Every other workflow is a reusable block that an entry workflow calls. Every job
runs on a self-hosted runner.

## Environments

The `resolve-env` job of `ci.yaml` maps the branch to the deploy environment.
Each deploy runs in the GitHub environment of that name. A branch outside the
map deploys nothing.

To add an environment, for example `qa`:

1. In `ci.yaml`, add its branch to `resolve-env` and to `on.push.branches`.
2. Create the GitHub environment, then set its secrets and variables.
3. Do the steps for a new environment in the README of each deploy target.

## Enable a deploy

Each deploy sits in an entry workflow as a commented drop-in block. The README of the target says what to prepare first.

1. Uncomment the deploy job **and** its line under `send-notification.needs`.
2. In each GitHub environment, set the secrets and the `vars.*` that the called
   workflow reads. A value that is the same in all environments can stay at
   repository level.

A deploy drop-in passes `secrets: inherit`, so the job reads the secrets of its
GitHub environment. A variable in the `with:` of a drop-in comes from the
repository level, because the caller job has no environment.

Give `prod` a required reviewer and a deployment branch rule for `main` only.
Then no other branch can read a `prod` secret.

## Quality

`quality.yaml` runs the build, lint, typecheck, unit tests, one E2E suite per app
and the native builds of the mobile app. The `Test Report` check run lists the
failed suites and tests of the run.

The E2E jobs start their containers through the Docker socket of the runner, so
the self-hosted Linux runner needs a reachable Docker daemon.

## Caches

`cache-cleanup.yaml` deletes the caches of a pull request when it closes. To manage caches by hand:

```sh
gh cache list --repo <owner>/<repo>
gh cache delete <cache-id> --repo <owner>/<repo>
```

[`quinck-io/runner-maintenance`](https://github.com/quinck-io/runner-maintenance)
cleans the disk of the runner host. No workflow does.
