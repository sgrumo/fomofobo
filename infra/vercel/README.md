# Vercel

The fullstack app deploys to Vercel. `vercel.json` of the app names the framework, the commands, the compute model and the execution region. The
project itself needs one setting and the variables.

## Root Directory

`vercel.json` has **no** key for the root directory: it is a project setting.
On each Vercel project, set it to the directory of the app, `apps/<fullstack-app>`, in Settings -> Build and Deployment ->
Root Directory, before the first deploy. The CLI has no flag for it. The only
other way is the REST API:

```bash
curl -X PATCH "https://api.vercel.com/v9/projects/$PROJECT?teamId=$TEAM" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory":"apps/<fullstack-app>","sourceFilesOutsideRootDirectory":true}'
```

`sourceFilesOutsideRootDirectory` is the API name of the "Include files outside
the root directory" toggle, and it **must stay on**. The app imports the
workspace packages, and the build fails without them.

## Node version

`engines.node` in `package.json` of the app pins the Node version to
`24.x`. The key overrides the Node.js Version setting of the project, so every
build runs on Node 24. It matches `.nvmrc`. If you change one, change the other.

## Region

`vercel.json` pins every function of the project to the region of the
database, because each request makes several round trips to Postgres. Our
databases live in AWS `eu-west-1`, so the project picks Dublin (`dub1`). Other
European regions are `cdg1` Paris, `arn1` Stockholm and `lhr1` London.

The key pins compute only. Static assets and cached responses still serve from
the global edge network.

## Fluid compute

`"fluid": true` turns on fluid compute for every deploy of the project. One
instance serves several requests at the same time, which also keeps the
Postgres pool of each instance in use.

`functions` caps every function of `src/app` at 60 seconds. A request that
hangs, for example on Postgres or on the OIDC provider, stops there and spends
no more compute.

## Deploying

If `ci.yaml` holds a `deploy-vercel` job, CI builds on the runner and uploads
only the output. That job needs `git.deploymentEnabled` set to `false` in
`vercel.json`, so a push does not start a second build through the Git
integration. Otherwise, connect the repository in the dashboard, and Vercel
builds every push against the project settings. The rest of this section is
about the CI job.

### One Vercel project per environment

Each deploy environment has its own Vercel project. CI deploys to the
Production target of that project, never to Preview. A Preview deployment gets
a new URL on each deploy, and only the Git integration can give a branch a
fixed domain. A Production deployment keeps the domains of its project.

The `resolve-env` job of `ci.yaml` maps the branch to the deploy environment.
The `deploy-vercel` job runs in the GitHub environment of that name and reads
the variable `VERCEL_PROJECT_ID` there. So the GitHub environment selects the
Vercel project.

The `if:` of the `deploy-vercel` job selects the branches that deploy:

| Branches     | `if:` of `deploy-vercel`                          | Vercel projects |
| ------------ | ------------------------------------------------- | --------------- |
| main only    | `needs.resolve-env.outputs.environment == 'prod'` | one             |
| main and dev | `needs.resolve-env.outputs.environment != ''`     | two             |

With main only, a push to `dev` runs quality and deploys nothing to Vercel.

### Set up main only

1. Create the Vercel project, and do the "Root Directory" step on it.
2. Set the variables of "Environment variables" on the project, with prod values.
3. Add the prod domain to the project.
4. Create the GitHub environment `prod`. Give it a required reviewer and a
   deployment branch rule for `main` only.
5. In `prod`, set the variable `VERCEL_PROJECT_ID` to the id of the project.
6. At repository level, set the variable `VERCEL_ORG_ID` and the secret
   `VERCEL_TOKEN`.

The setup is complete when a push to `main` ends with the URL of the prod
project in the job summary.

### Set up main and dev

1. Do the steps of "Set up main only".
2. Create a second Vercel project for dev, and do the "Root Directory" step on it.
3. Set the variables of "Environment variables" on the dev project, with dev
   values.
4. Add the dev domain to the dev project.
5. Create the GitHub environment `dev`. In it, set the variable
   `VERCEL_PROJECT_ID` to the id of the dev project.

If the two projects belong to different Vercel teams, set `VERCEL_ORG_ID` and
`VERCEL_TOKEN` in each GitHub environment, not at repository level.

The setup is complete when a push to `dev` ends with the URL of the dev project
in the job summary.

### Add dev later

If the project deploys main only, change the `if:` of `deploy-vercel` to
`!= ''`. Then do steps 2 to 5 of "Set up main and dev".

## Environment variables

Set each variable in the Production scope of the Vercel project, because CI
deploys to Production only. Set `APP_ENV=vercel`. It has no default on Vercel. An unset value stops the
boot, instead of falling back to the local shape, which answers every error
with a stack trace. Set the database and object store variables of
`.env.template` of the app too, and the `OIDC_*` ones of
[auth-oidc.md](../auth-oidc.md).

Every warm instance holds its own pool, so point `PGHOST` at a **pooled**
endpoint (PgBouncer, or the pooler of a managed Postgres). A direct endpoint
runs out of connections as the instance count grows.

The `vercel` shape verifies the RDS certificate. Set `PGHOST` to the RDS
endpoint hostname: a CNAME or an IP address fails the check. If a pooler such as
PgBouncer ends the TLS connection, it shows its own certificate, and the RDS
roots reject it.
