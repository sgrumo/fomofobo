---
standard: draft
title: fomofobo
---

## 2026-10-22 · Photos stored as a two-color dither

### Changed

The backoffice dithers each photo in two colors, at most 1200 pixels wide, before it uploads it, and a one-off tool dithers the photos stored before. The dither effect the public app drew on each photo was thrown away.

### Why

A client request. The owner wants the dithered look baked into every photo, link previews included.

### Check next time

Agree on the image treatment and the stored size before the upload flow is built: changing it later means a migration of the photos in the bucket.

## 2026-10-22 · Ended events stay for a number of days an Admin sets

### Changed

The days an ended event stays in the public app, and keeps its photos, are a setting of the backoffice, three by default. An Admin changes it at any time, and the daily photo purge follows it.

### Why

A client request. The owner wants to decide the retention without a release.

### Check next time

Ask which limits of the domain the client wants to tune alone, and plan a settings page for them from the start.

## 2026-10-21 · English dropped, the app speaks Italian

### Changed

The app serves Italian alone, and an old link to an English page opens the Italian page. The English copy of every screen left the app.

### Why

A client request. The owner wants the app in one language.

### Check next time

Agree on the languages of the app before the team writes the copy of the first screen.

## 2026-10-19 · Ended events hidden, their photos purged

### Changed

An ended occurrence leaves the public app three days after its end. A daily job then deletes the photos of each event with no visible occurrence left, and the database keeps the rows for statistics.

### Why

A decision. The owner wants to cut the storage cost of R2 and keep the data for later statistics.

### Check next time

Agree on how long past events and their media stay online before the estimate.

## 2026-10-16 · Hosting moved to Vercel, Turso and R2

### Changed

The app moved from Cloudflare Workers and D1 to Vercel Hobby and Turso, and R2 keeps the photos. The Worker setup, the D1 driver and the E2E harness were rebuilt, about one day of rework.

### Why

A decision. The owner wants v1 on free plans. On the Workers Free plan, a probe of the bare app rendered each page in more than 10 ms of CPU, and steady load ended 2% of the requests at that limit.

### Check next time

Measure the CPU time per request on the free plan of the target host before the stack decision.

## 2026-10-15 · Stack moved to Cloudflare Workers, D1 and R2

### Changed

fomofobo ships on Cloudflare Workers, D1 and R2 in place of the PostgreSQL, S3, Vercel and Docker stack of the template. The database layer, the photo uploads, the E2E harness and the deploy pipeline move before any domain code.

### Why

A decision. The functional analysis names Cloudflare, and the template targets another stack.

### Check next time

Confirm the hosting and database target against the template stack before the estimate.
