# Docker stack

One Compose stack serves every app the project holds. It runs on any server with
Docker installed.

Each app owns a compose fragment and its own Caddy files.
`docker-compose.yaml` names the fragments the project holds. `compose.data.yaml`
is the one exception: the database, the object store and the migration gate
serve every backend, so no single app owns them.

## Setup

```bash
cd infra/docker
cp .env.template .env
# Edit .env - set every value it marks "Required"
docker compose up -d --build
```

A required value that is unset or empty stops `docker compose up` before any
container starts. The message names the variable to set.

The Docker stack runs with `APP_ENV=docker`, which makes the database and store
credentials mandatory. If a value is missing or empty, the API does not start
and restarts in a loop, and `caddy` never starts. Run `docker compose logs api`
first: the log names each bad variable and the rule it breaks.

The `api` service also loads `api.env`, the committed runtime env of the API.
A change to it is a commit, and the next deploy carries it.

## Deploy from CI

`.github/workflows/deploy-docker.yaml` copies the repository to the server, then
runs `docker compose up -d --build` from `infra/docker`. `ci.yaml` calls it on a
push or a manual dispatch of a branch that has an environment.

The stack has a fixed project name and fixed host ports, so each environment
needs its own server. Set `DEPLOY_HOST` and `DEPLOY_USER` in each GitHub
environment. For the standard on-prem VM, `DEPLOY_HOST` is `192.168.178.182`.

The server needs Docker and Docker Compose, SSH access with the deploy key, and
`infra/docker/.env`.

## Routing

Each app drops a file into `caddy/routes/` or `caddy/sites/`, so the Caddyfile names
no app. A file in `routes/` adds paths to `$DOMAIN`. A file in `sites/` adds a site
address of its own.

```
Caddy (:80/:443)
├── $DOMAIN
│   ├── /api/*   -> api:3000 -> postgres:5432
│   │                               ↑
│   │                          migrations (init)
│   └── /*       -> the SPA
├── $S3_PUBLIC_DOMAIN -> objectstore:9000
└── $<APP>_DOMAIN     -> every other frontend
```

Only one app can own `/`. The standalone API claims `/api/*` and the SPA claims `/`.
An app that can also own `/` ships a file for each directory. With no other app on
`$DOMAIN`, it takes `/` alone through its file in `routes/`. Otherwise it answers on
its own `$<APP>_DOMAIN` through its file in `sites/`. Every other frontend takes a
site address of its own. Dozzle answers on `:8080`.

CAUTION: Two site blocks with one address make Caddy refuse the whole config
with "ambiguous site definition". Give each frontend a distinct domain.

## Images

Every image builds from `Dockerfile`, and a service picks one with `target:`.

BuildKit builds only the stages a target needs. The classic builder runs every
step above the target instead, so install `docker-buildx` on a build host to
keep the builds short.

CAUTION: The Compose project name gives every volume its prefix. To adopt the
volumes of an existing deployment, set `COMPOSE_PROJECT_NAME` in `.env` to that
project name, and stop the old stack first so Caddy can bind its ports.

## Object storage (RustFS)

RustFS makes a new bucket private, so the store is private in every stack. The
browser reaches an object only through a presigned URL that the backend mints.

CAUTION: The host in a presigned URL is always the `S3_ENDPOINT` of the backend,
and the browser calls that host directly. The internal `objectstore:9000` name
resolves inside the Docker network only, so it cannot work. Set `S3_ENDPOINT` to
a host the browser can reach.

Caddy therefore proxies the S3 API at a separate site address,
`S3_PUBLIC_DOMAIN`. It is a subdomain and not a path prefix, because an S3
signature covers the full request path: stripping a prefix invalidates it.

RustFS has no CORS environment variable, so the rule lives on the bucket. The
one-shot `objectstore-init` service writes the bucket and the rule before `api`
starts. After a change to `S3_CORS_ALLOW_ORIGIN`, run the service again:

```bash
docker compose up -d --force-recreate objectstore-init
```

CAUTION: Make a backup of the `objectstore_data` volume, or use a multi-disk
deployment. Each stack runs one RustFS node on one volume. RustFS calls this
single-node single-disk. It applies no erasure coding, so a lost disk is lost
data.

CAUTION: Never point RustFS at `minio_data`. RustFS cannot read the data
directory of MinIO, because the on-disk formats differ. To move an existing
stack, start RustFS on a second volume. Then copy every object across the S3
API with `rclone sync`.

Set these values in `.env`:

1. `S3_ACCESS_KEY` and `S3_SECRET_KEY`. These become the store root credentials
   and the S3 credentials of the API.
2. `S3_PUBLIC_DOMAIN` to a host that resolves to this server, and
   `S3_PUBLIC_ENDPOINT` to `https://$S3_PUBLIC_DOMAIN`. Compose passes the
   second one to the API as `S3_ENDPOINT`.
3. `S3_CORS_ALLOW_ORIGIN` to the origins of the pages that upload files, as a
   comma-separated list. The browser calls the store directly, so an origin
   that the list does not name fails every upload. An empty value covers
   `$DOMAIN`. An app with its own site address adds that address on its
   own, whatever this value holds.

## TLS

With `DOMAIN=localhost`, Caddy generates a self-signed certificate. A browser
and a tool such as Bruno then warn about it. Disable SSL verification, or use
`curl -k`.

To get a Let's Encrypt certificate, set `DOMAIN=yourdomain.com` in `.env`. Caddy
obtains and renews it. Ports 80 and 443 must be reachable, and DNS must point at
the server.

## Database migrations

The `migrations` init service waits for PostgreSQL, runs `drizzle-kit migrate`,
then exits. The API starts only after it succeeds. No database port reaches the
host: migrations run inside the Docker network.

## Logs

Dozzle shows the logs of every container. It is read-only and stores nothing.
