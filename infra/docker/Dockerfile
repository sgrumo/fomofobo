# Every image of the stack. Compose picks one with `target:`, and BuildKit
# builds only the stages that target needs.
#
# Targets: migrations, objectstore-init, backend, nextjs, frontend.
#
# pnpm runs only while an image builds, never in a container.

FROM node:24.21.0-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20 AS runtime
WORKDIR /app

FROM runtime AS base
# pnpm version comes from the root package.json "packageManager" field.
RUN corepack enable
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Caches until the deps change.
FROM base AS root-files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# ── Workspace ──
# Lockfile-only fetch, so this layer caches until the deps change.
FROM root-files AS workspace-deps
RUN pnpm fetch

FROM workspace-deps AS workspace-build
COPY . .
RUN pnpm install --offline --frozen-lockfile

# ── One-shot images ──
# `pnpm deploy` copies one package with its dependencies, and the image calls a
# binary of that package directly. The workspace does not inject its packages,
# so the flag turns injection on for this command only.
FROM workspace-build AS migrations-build
RUN pnpm --config.inject-workspace-packages=true --filter storage deploy /out

FROM runtime AS migrations
COPY --from=migrations-build /out ./
USER node
# Generated SQL migrations, not `db:force-push` (which drops data with no history).
CMD ["node_modules/.bin/drizzle-kit", "migrate", "--config", "drizzle.config.ts"]

FROM workspace-build AS objectstore-init-build
RUN pnpm --config.inject-workspace-packages=true --filter objectstore-init deploy /out

FROM runtime AS objectstore-init
COPY --from=objectstore-init-build /out ./
USER node
CMD ["node_modules/.bin/tsx", "src/entry-points/provision.ts"]

# ── App images ──
FROM workspace-build AS backend-build
RUN pnpm build && pnpm -C apps/backend-alpen build

FROM runtime AS backend
COPY --from=backend-build /app/apps/backend-alpen/dist/main.cjs ./main.cjs

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER node
CMD ["node", "main.cjs"]

# Builds any Next.js app of the workspace, named by APP_DIR.
FROM workspace-build AS nextjs-build
ARG APP_DIR
# `output: "standalone"` traces from the repo root, so the bundle carries every
# workspace package the app imports.
#
# An app that reads a CMS while it builds gets the credential as a build secret. It
# exists for this one command and stays out of the image and its history. If compose
# passes no secret, the variable stays unset.
RUN --mount=type=secret,id=datocms_published_token,env=DATOCMS_PUBLISHED_TOKEN \
    pnpm -C ${APP_DIR} build

FROM runtime AS nextjs
ARG APP_DIR
ENV NODE_ENV=production
ENV PORT=3000
# Binds every interface, or the container answers nobody.
ENV HOSTNAME=0.0.0.0
# The traced bundle keeps the workspace layout, so the three copies below land
# where the generated server.js expects them. Never run `pnpm install` in here:
# it breaks the traced node_modules.
COPY --from=nextjs-build /app/${APP_DIR}/.next/standalone ./
COPY --from=nextjs-build /app/${APP_DIR}/.next/static ./${APP_DIR}/.next/static
COPY --from=nextjs-build /app/${APP_DIR}/public ./${APP_DIR}/public
ENV APP_DIR=${APP_DIR}
EXPOSE 3000

USER node
CMD ["sh", "-c", "node ${APP_DIR}/server.js"]

# Builds any static app of the workspace, named by APP_DIR.
FROM workspace-build AS frontend-build
ARG APP_DIR
ARG VITE_BASE_API_URL
ENV VITE_BASE_API_URL=${VITE_BASE_API_URL}
RUN pnpm -C ${APP_DIR} build

FROM caddy:2.11.7-alpine@sha256:d8542f48d34a9cf4e4c11a478865229840e87e4c96ea3f439101f31a5d35f75f AS frontend
ARG APP_DIR
COPY --from=frontend-build /app/${APP_DIR}/dist /srv
# Non-root: the caddy binary carries cap_net_bind_service, so it still binds :80.
USER 1000:1000
EXPOSE 80
