# Vercel deploy

The app runs on Vercel, the database on Turso, and the files on Cloudflare R2. Every service runs on its free plan.

| Environment | Branch | Vercel target                | Turso database  | R2 buckets                              |
| ----------- | ------ | ---------------------------- | --------------- | --------------------------------------- |
| `prod`      | `main` | Production                   | `fomofobo-prod` | `fomofobo-prod`, `fomofobo-prod-photos` |
| `dev`       | `dev`  | Preview, bound to the branch | `fomofobo-dev`  | `fomofobo-dev`, `fomofobo-dev-photos`   |

One Vercel project serves both environments. The Git integration of Vercel builds each push to `main` and `dev`, and `vercel.json` of the app keeps every other branch from a build.

The build command of `vercel.json` applies the pending migrations to the database of `DATABASE_URL`, then runs `next build`. A failed migration stops the deploy, and the running version keeps serving.

## Plan limits

- Vercel Hobby is for non-commercial use only. Ads, paid listings or a paying client break its terms. See the [Hobby plan](https://vercel.com/docs/plans/hobby).
- Hobby gives a monthly budget of Active CPU and invocations. Past it, the project waits until the next cycle. Active CPU counts the time that code runs, not the time that it waits on the database.
- Hobby deploys a repository of a personal GitHub account, and a commit of the account owner alone. Make sure that the git author email of each commit belongs to the GitHub account of the owner.
- Turso archives a free database after a period with no activity. An archived database answers no query. Run `turso group unarchive <group>` to wake it. `fomofobo-dev` sees the least traffic and archives first.
- `vercel.json` pins the functions to `dub1`, next to the Turso location `aws-eu-west-1`. A request makes several round trips to the database, so the two stay in one region.

## Set up an environment

`<env>` is `dev` or `prod`. Run the Turso commands after `turso auth login`, and the R2 commands from `apps/fullstack-fomofobo` with `pnpm dlx wrangler`, after `pnpm dlx wrangler login`.

1. Create the database with `turso db create fomofobo-<env> --location aws-eu-west-1`. Read its URL with `turso db show fomofobo-<env> --url`, and create its token with `turso db tokens create fomofobo-<env>`.
2. Create the private bucket with `pnpm dlx wrangler r2 bucket create fomofobo-<env>`.
3. Create the photos bucket with `pnpm dlx wrangler r2 bucket create fomofobo-<env>-photos`. In the Cloudflare dashboard, connect a custom domain to it and disable its `r2.dev` URL. R2 makes a whole bucket public, never a prefix, so the photos bucket holds photos alone. The domain must be a zone of the same Cloudflare account.
4. Set the CORS rule of both buckets with `pnpm dlx wrangler r2 bucket cors set <bucket> --file cors.json`. The browser uploads with a presigned `PUT`, so the rule allows the app origin, the `PUT` method and the `Content-Type` header:

    ```json
    [
        {
            "AllowedOrigins": ["https://<app origin>"],
            "AllowedMethods": ["PUT"],
            "AllowedHeaders": ["Content-Type"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3600
        }
    ]
    ```

5. Create an R2 API token with Object Read and Write on the buckets of the environment.
6. Set every variable of "Runtime values" in the Vercel target of the environment. For `dev`, bind each Preview variable to the `dev` branch.
7. Push the branch of the environment.

The environment is ready when the deploy of the branch ends green and `https://<app origin>/api/health` answers `200`.

## The Vercel project

Do these steps one time, on the first environment.

1. Import the GitHub repository in Vercel, signed in with the GitHub account of the owner.
2. Set Root Directory to `apps/fullstack-fomofobo`. If the build settings show "Include files outside the root directory", keep it on: the app imports the workspace packages.
3. Set the production branch to `main`.

`engines.node` in `package.json` of the app sets the Node version of the build and of the functions.

## Runtime values

This table is the committed record of each value, as "Runtime env" in `infra/AGENTS.md` asks.

| Value                                            | Kind          | `prod`                                          | `dev`                                           |
| ------------------------------------------------ | ------------- | ----------------------------------------------- | ----------------------------------------------- |
| `APP_ENV`                                        | Configuration | `vercel`                                        | `vercel`                                        |
| `APP_BASE_URL`                                   | Configuration | PLACEHOLDER(TQ-23: origin of prod)              | PLACEHOLDER(TQ-23: origin of dev)               |
| `DATABASE_URL`                                   | Configuration | PLACEHOLDER(libsql URL of fomofobo-prod)        | PLACEHOLDER(libsql URL of fomofobo-dev)         |
| `S3_ENDPOINT`                                    | Configuration | `https://<account id>.r2.cloudflarestorage.com` | `https://<account id>.r2.cloudflarestorage.com` |
| `S3_BUCKET`                                      | Configuration | `fomofobo-prod`                                 | `fomofobo-dev`                                  |
| `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_AUDIENCE` | Configuration | See `infra/auth-oidc.md`                        | See `infra/auth-oidc.md`                        |
| `DATABASE_AUTH_TOKEN`                            | Credential    | Token of `fomofobo-prod`                        | Token of `fomofobo-dev`                         |
| `S3_ACCESS_KEY`, `S3_SECRET_KEY`                 | Credential    | R2 token of the environment                     | R2 token of the environment                     |
| `OIDC_CLIENT_SECRET`                             | Credential    | See `infra/auth-oidc.md`                        | See `infra/auth-oidc.md`                        |

Mark each credential as Sensitive in Vercel, so the dashboard never shows it again.

## Restore

Turso keeps a point in time of each free database for one day. To return a database to an earlier point, create a copy with `turso db create fomofobo-<env>-restore --from-db fomofobo-<env> --timestamp <time>`, then point `DATABASE_URL` and `DATABASE_AUTH_TOKEN` of the environment at the copy and redeploy.
