---
standard: draft
title: fomofobo
---

## 2026-10-22 · Saves reach the server to count interest

### Changed

Saved events no longer stay on the device alone. Each save and unsave reaches the server under a random id of the device, and the app shows the count of an occurrence once it reaches the participant threshold of the Admin.

### Why

A client request. Organizers and visitors want to see the interest in an event, which a list on the device cannot count.

### Check next time

Ask whether the product counts interest across visitors before saves stay on the device alone. The privacy text of the launch must name the device id.

## 2026-10-22 · Event photos become optional

### Changed

An event saves with no photo, and an event whose photos the daily job deleted saves with no new one. The venue cover, the image an Admin uploads for the primary category, or a generated image of the category icon takes the place of a missing cover.

### Why

A client request. Organizers publish events before they have a photo.

### Check next time

Ask whether every event has a photo at publication time before the form requires one.

## 2026-10-22 · Free-text prices become a price scheme

### Changed

The event price moved from free text to a scheme: free or paid, a full price, reduced prices, a membership card and a minimum age. Events also take an optional capacity, and the old texts became the notes of a paid scheme.

### Why

A client request. Venues price by audience and by membership, which one text field could not express or filter.

### Check next time

Ask how the venues price their events, reductions and membership cards included, before the event form takes a price.

## 2026-10-22 · Cinemas and museums become permanent venues

### Changed

A venue can be a cinema, a museum, a theatre or a gallery, with a link to its programme outside the app. Only Admins manage these venues.

### Why

A client request. Cinemas and museums have no start and no end, and their programme lives on their own sites.

### Check next time

Ask whether some places stay open over time with no dated events, before the map shows only dated results.

## 2026-10-22 · Venues get a public page with past events

### Changed

Each venue has a public page with its profile, its upcoming events and a paged list of its past events. The search field also finds venues of the area.

### Why

A client request. The client wants visitors to follow a place, not only a single event.

### Check next time

Ask whether past events must stay readable before the retention rules are set, because the history reads events whose photos are gone.

## 2026-10-22 · Venues get owners, profiles and blocks

### Changed

An Organizer now creates and edits one venue of its own, and an Admin assigns the owner and blocks a venue without blocking its events. Venues gained a description, a cover and social links.

### Why

A client request. The client wants each place to present itself, and organizers to keep their own venue up to date.

### Check next time

Ask who maintains the shared records, such as venues, before the backoffice gives the edit right to one role.

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
