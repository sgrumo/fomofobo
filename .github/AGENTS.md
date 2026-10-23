# Workflows

## Structure

- The entry workflows are `ci.yaml` on every pull request and push, `cache-cleanup.yaml` on a closed pull request, and `purge-photos.yaml` on a daily schedule. Every other workflow is reusable and only `workflow_call` reaches it.
- The mobile app has no workflow of its own: a person runs its Fastlane lanes on a Mac. `quality.yaml` only typechecks and lints it, because it has no E2E suite.
- A deploy is a job of an entry workflow. In `ci.yaml`, it needs `quality` and `resolve-env`, and runs only when `resolve-env` maps the branch to an environment. A deploy that a project does not use yet stays a commented drop-in.
- `deploy-vercel` also runs only when the `vercel` output of `quality` is true. A change that reaches only the mobile app, an E2E suite or a doc does not deploy.
- `resolve-env` in `ci.yaml` is the map from branch to deploy environment. Each deploy takes the result as its `environment` input and as its GitHub environment.
- `purge-photos.yaml` repeats that map in its `dispatch` matrix. A schedule runs on the default branch alone, and the `prod` environment admits `main` alone, so the schedule dispatches one run per environment on its branch. If you change `resolve-env`, change the matrix too.
- Never trigger a workflow on a tag push.
- `quality.yaml` takes no inputs. To scope it to a repository, remove the jobs that the repository has no code for.
- Each workflow declares its own `runs-on`. A job runs on a GitHub-hosted `ubuntu-latest` runner.

## Change detection

- The `changes` job of `quality.yaml` runs `.github/scripts/detect-changes.mjs` against the base of the event: the base commit of a pull request, the previous head of a push. Its outputs gate the other jobs.
- `web` gates the build, the unit tests and the E2E suites of every package but the mobile app. `mobile` gates `mobile-check`. `vercel` gates `deploy-vercel` in `ci.yaml`.
- The script reads the workspace graph with `pnpm list --filter "...[<base>]"`, so a change to a package reaches every package that depends on it. Add no path list for a workspace package.
- A file that every package reads without a workspace dependency, such as the lockfile or `configs/`, reaches every part. List it in `sharedPrefixes`. A deploy file outside the workspace, such as `infra/vercel/`, goes in `vercelPrefixes`.
- A manual run, a new branch or a failed detection reaches every part. A wrong guess runs too much, never too little.

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

## Caches

- `cache-cleanup.yaml` deletes the caches of `refs/pull/<n>/merge`, because a `pull_request` run writes there and not to the branch.

## Runner disk

GitHub discards each hosted runner after its job, so a workflow leaves no state on a host.
