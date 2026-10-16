---
standard: draft
title: fomofobo
---

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
