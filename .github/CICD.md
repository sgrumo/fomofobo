# CI/CD

`ci.yaml` runs `quality.yaml` on every pull request and push, and then the
deploys of the branch. Each deploy needs `quality`, so a deploy cannot start
unless quality passed.

No workflow builds or ships the mobile app. A person runs its Fastlane lanes on
a Mac, as `apps/mobile-fomofobo/README.md` says.

`purge-photos.yaml` runs every day. It dispatches one run of itself for each
environment, on the branch of that environment, and each run deletes the photos
of the ended events. An environment whose config file holds a `PLACEHOLDER` is
skipped. To run it by hand, dispatch it on the branch of the environment.

Every other workflow is a reusable block that an entry workflow calls. Every job
runs on a GitHub-hosted `ubuntu-latest` runner.

## Environments

The `resolve-env` job of `ci.yaml` maps the branch to the deploy environment.
Each deploy runs in the GitHub environment of that name. A branch outside the
map deploys nothing.

To add an environment, for example `qa`:

1. In `ci.yaml`, add its branch to `resolve-env` and to `on.push.branches`.
2. Create the GitHub environment, then set its secrets and variables.
3. Do the steps for a new environment in the README of each deploy target.

## Deploys

The `deploy-vercel` job of `ci.yaml` deploys the app, only when the changes reach
the app, a package it depends on, or its deploy files. `infra/vercel/README.md` says
what each environment needs first. To deploy with no change, dispatch `ci.yaml` on
the branch.

A deploy job passes `secrets: inherit`, so the job reads the secrets of its
GitHub environment. A variable in the `with:` of a deploy job comes from the
repository level, because the caller job has no environment.

Give `prod` a deployment branch rule for `main` only, and a required reviewer
where the plan of the account offers one. Then no other branch can read a `prod`
secret.

## Quality

`quality.yaml` runs the build, lint, typecheck, unit tests and one E2E suite per
app, and only the typecheck and lint of the mobile app. Each job runs only when
the changes reach its part of the repo, as `.github/AGENTS.md` says. The
`Test Report` check run lists the failed suites and tests of the run.

## Caches

`cache-cleanup.yaml` deletes the caches of a pull request when it closes. To manage caches by hand:

```sh
gh cache list --repo <owner>/<repo>
gh cache delete <cache-id> --repo <owner>/<repo>
```

[`quinck-io/runner-maintenance`](https://github.com/quinck-io/runner-maintenance)
cleans the disk of the runner host. No workflow does.
