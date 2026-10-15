# Cloudflare deploy

The app runs as one Worker per deploy environment, `dev` and `prod`. Each environment has its own D1 database, a private R2 bucket and a public R2 bucket for event photos.

`.github/workflows/deploy-cloudflare.yaml` builds the Worker bundle, applies the pending D1 migrations, then uploads the bundle. The block of the environment under `env` in `apps/fullstack-fomofobo/wrangler.jsonc` holds the Worker name, the vars and the D1 binding.

The account needs the Workers Paid plan. The Free plan gives 10 ms of CPU per request, and server rendering exceeds it.

## Set up an environment

Run each command from `apps/fullstack-fomofobo`, after `pnpm exec wrangler login`. `<env>` is `dev` or `prod`.

1. Create the database with `pnpm exec wrangler d1 create fomofobo-<env>`. Copy the `database_id` that it prints into the `d1_databases` entry of the `<env>` block.
2. Create the private bucket with `pnpm exec wrangler r2 bucket create fomofobo-<env>`.
3. Create the photos bucket with `pnpm exec wrangler r2 bucket create fomofobo-<env>-photos`. In the dashboard, connect a custom domain to it and disable its `r2.dev` URL. R2 makes a whole bucket public, never a prefix, so the photos bucket holds photos alone.
4. Set the CORS rule of both buckets with `pnpm exec wrangler r2 bucket cors set <bucket> --file cors.json`. The browser uploads with a presigned `PUT`, so the rule allows the app origin, the `PUT` method and the `Content-Type` header:

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

5. Create an R2 API token with Object Read and Write on the buckets of the environment. Store its keys with `pnpm exec wrangler secret put S3_ACCESS_KEY --env <env>` and `pnpm exec wrangler secret put S3_SECRET_KEY --env <env>`.
6. Replace every `PLACEHOLDER(...)` value of the `<env>` block: the app origin, the OpenID provider values (see `infra/auth-oidc.md`), and the S3 endpoint `https://<account id>.r2.cloudflarestorage.com`.
7. In GitHub, create the environment `<env>`. Give it the secret `CLOUDFLARE_API_TOKEN`, with Workers Scripts Edit, D1 Edit and Workers R2 Storage Edit on the account, and the variable `CLOUDFLARE_ACCOUNT_ID`.
8. Enable the deploy drop-in of `ci.yaml`, as `.github/CICD.md` describes.

The environment is ready when a push to its branch deploys and `https://<app origin>/api/health` answers `200`.

## Runtime values

| Value                                                                       | Kind          | Store                                           |
| --------------------------------------------------------------------------- | ------------- | ----------------------------------------------- |
| `APP_ENV`, `APP_BASE_URL`, `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_AUDIENCE` | Configuration | `vars` of the `<env>` block of `wrangler.jsonc` |
| `S3_ENDPOINT`, `S3_BUCKET`                                                  | Configuration | `vars` of the `<env>` block of `wrangler.jsonc` |
| `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `OIDC_CLIENT_SECRET`                      | Credential    | `wrangler secret put <name> --env <env>`        |

## Migrations

To return a database to an earlier point, use D1 Time Travel: `pnpm exec wrangler d1 time-travel restore fomofobo-<env> --timestamp <time>`.
