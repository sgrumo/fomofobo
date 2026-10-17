# Vercel deploy

The app runs on Vercel, the database on Turso, the event photos on Cloudflare R2, and the place search on Geoapify. Every service runs on its free plan.

| Environment | Branch | Vercel project  | Turso database  | R2 bucket              |
| ----------- | ------ | --------------- | --------------- | ---------------------- |
| `prod`      | `main` | `fomofobo-prod` | `fomofobo-prod` | `fomofobo-prod-photos` |
| `dev`       | `dev`  | `fomofobo-dev`  | `fomofobo-dev`  | `fomofobo-dev-photos`  |

`dev` runs the `preview` shape of `APP_ENV`, and `prod` runs `vercel`. `preview` serves the `/dev/*` pages, the API documentation and detailed errors to anyone who opens its URL. `apps/fullstack-fomofobo/src/server/config/app-config.ts` lists what each shape serves.

`.github/workflows/deploy-vercel.yaml` deploys each push to `main` and `dev`, after the quality jobs pass. It runs these steps:

1. Apply the pending migrations to the Turso database of the environment. A failed migration stops the deploy, and the running version keeps serving.
2. Write every runtime value into the Vercel project: the configuration of `env/<env>.env` and the credentials of the GitHub environment.
3. Build the app on the runner and upload the prebuilt output to the Production target of the project.

The upload leaves the git metadata out, so Vercel runs no check on the commit author. `vercel.json` of the app turns off the Git builds of Vercel.

## Plan limits

- Vercel Hobby is for non-commercial use only. Ads, paid listings or a paying client break its terms. See the [Hobby plan](https://vercel.com/docs/plans/hobby).
- Hobby gives a monthly budget of Active CPU and invocations. Past it, the project waits until the next cycle. Active CPU counts the time that code runs, not the time that it waits on the database.
- Turso archives a free database after a period with no activity. An archived database answers no query. Run `turso group unarchive <group>` to wake it. `fomofobo-dev` sees the least traffic and archives first.
- `vercel.json` pins the functions to `dub1`, next to the Turso location `aws-eu-west-1`. A request makes several round trips to the database, so the two stay in one region.
- The workflows run on GitHub-hosted runners: free on a public repository, with a monthly allowance of minutes on a private one.

## Set up an environment

`<env>` is `dev` or `prod`. Run the Turso commands after `turso auth login`, and the R2 commands from `apps/fullstack-fomofobo` with `pnpm dlx wrangler`, after `pnpm dlx wrangler login`.

At repository level, set the variable `VERCEL_ORG_ID` and the secret `VERCEL_TOKEN` one time. `VERCEL_ORG_ID` is the id of the Vercel account that owns both projects.

1. Create the database with `turso db create fomofobo-<env> --location aws-eu-west-1`. Write its URL, from `turso db show fomofobo-<env> --url`, into `DATABASE_URL` of `env/<env>.env`.
2. Create the photos bucket with `pnpm dlx wrangler r2 bucket create fomofobo-<env>-photos`. R2 makes a whole bucket public, never a prefix, so the bucket holds photos alone. In the Cloudflare dashboard, connect a custom domain to it and disable its `r2.dev` URL. The domain must be a zone of the same Cloudflare account. Until `dev` has a domain (TQ-23), keep its `r2.dev` URL enabled and use it as the public URL. Cloudflare rate-limits that URL. Write the public URL into `PHOTOS_PUBLIC_BASE_URL` of `env/<env>.env`.
3. Set the CORS rule of the bucket with `pnpm dlx wrangler r2 bucket cors set fomofobo-<env>-photos --file cors.json`. The browser uploads with a presigned `PUT`, so the rule allows the app origin, the `PUT` method and the `Content-Type` header:

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

4. Create an R2 API token with Object Read and Write on the bucket of the environment.
5. Create a Geoapify project for the environment at myprojects.geoapify.com, and copy its API key. The free plan gives 3,000 credits a day and needs no card. The public app shows the "Powered by Geoapify" link that the free plan asks for.
6. In Vercel, create an empty project `fomofobo-<env>` with Root Directory `apps/fullstack-fomofobo`, and connect no Git repository. Write its production domain into `APP_BASE_URL` of `env/<env>.env`. The auth library accepts a sign-in only from this origin.
7. In GitHub, create the environment `<env>`. Give it the variable `VERCEL_PROJECT_ID`, the id of the project, and the secrets of "Runtime values".
8. Replace every `PLACEHOLDER` of `env/<env>.env`. The deploy refuses a file that holds one.
9. Push the branch of the environment.

The environment is ready when the deploy job of the branch ends green and `https://<app origin>/api/health` answers `200`.

The backoffice has no sign-up. Create the first Admin with the `admin-accounts` CLI, on the Turso URL of the environment and a database token. "Database" in the root `README.md` shows the command.

`engines.node` in `package.json` of the app sets the Node version of the build and of the functions.

## Runtime values

`env/<env>.env` holds the configuration of each environment. The GitHub environment holds the credentials:

| Secret                | Value                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `DATABASE_AUTH_TOKEN` | `turso db tokens create fomofobo-<env>`                                                              |
| `S3_ACCESS_KEY`       | Access key id of the R2 token of the environment                                                     |
| `S3_SECRET_KEY`       | Secret access key of the R2 token of the environment                                                 |
| `BETTER_AUTH_SECRET`  | At least 32 random characters, for example `openssl rand -base64 32`. A new value ends every session |
| `GEOAPIFY_API_KEY`    | API key of the Geoapify project of the environment                                                   |

The deploy writes a credential as Sensitive. A value set in the Vercel dashboard alone lasts until the next deploy overwrites it, or never reaches the next project.

## Restore

Turso keeps a point in time of each free database for one day. To return a database to an earlier point, create a copy with `turso db create fomofobo-<env>-restore --from-db fomofobo-<env> --timestamp <time>`. Then point `DATABASE_URL` of `env/<env>.env` and the `DATABASE_AUTH_TOKEN` secret at the copy, and push.
