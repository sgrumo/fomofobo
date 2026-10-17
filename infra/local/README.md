# Local stack

The local stack is RustFS for the photo uploads. The
database needs no container: `pnpm db:migrate` writes it to `.data/local.db` at
the repo root, a libSQL file that the app reads by default. RustFS serves the
S3 API on `:9000` and a web console at
`http://localhost:9001/rustfs/console/` (`admin` / `admin`). The
root path of the console answers 403. `pnpm infra:up:local` waits for the
store, then creates the `fomofobo` photos bucket and its CORS rule. Like the
public R2 bucket, it answers an anonymous read of a photo URL.

```bash
pnpm infra:up:local     # start
pnpm infra:down:local   # stop, data kept
pnpm db:migrate         # apply the migrations to the local database file
pnpm db:seed            # replace its rows with the dev seed
pnpm dev:<app>          # start an app on the host
```

Named volumes hold the data, so it survives a stop. To drop it, run
`docker compose -f infra/local/docker-compose.yaml down -v`.

The API needs no configuration here, except the Geoapify key below. `APP_ENV` defaults to `local`, which
resolves the store endpoint and credentials to the local stack
(`http://localhost:9000`, `admin`), and the photo URLs to
`http://localhost:9000/fomofobo`. To override them, set `S3_ENDPOINT`,
`S3_ACCESS_KEY`, `S3_SECRET_KEY` and `PHOTOS_PUBLIC_BASE_URL`.

The places search calls Geoapify. If `GEOAPIFY_API_KEY` is unset, the places
route answers `503`. Set it in `apps/fullstack-fomofobo/.env.local`, which
`next dev` reads. Git ignores the file.

The backend runs on the host, so it reaches the store at `localhost` and mints
presigned URLs the browser can reach. `S3_CORS_ALLOW_ORIGIN` defaults to the
local dev origins (`http://localhost:5173,http://localhost:3000`, the Vite
and Next dev servers).
