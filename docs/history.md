---
standard: draft
title: fomofobo
---

## 2026-11-24 · The date filter gains day parts

### Changed

Morning, afternoon and evening chips narrow the results to a part of each day of the date window, on the web and in the native app. The evening runs to 06:00 of the next day.

### Why

A client request. A visitor plans by the part of the day as well as by the day.

### Check next time

Agree early whether the date filter needs hours as well as days, and where the night ends.

## 2026-11-24 · The native app asks which maps app to use

### Changed

The directions of the native app open a choice of the maps apps of the phone in place of the default maps app of the platform. On iOS the choice holds only the apps that the phone has.

### Why

A client request. Many visitors use Google Maps or Waze on an iPhone.

### Check next time

Agree early which maps apps the directions offer, since iOS must declare each app that the native app looks for.

## 2026-11-23 · Admins add events from a claude.ai chat

### Changed

An Admin adds and changes events, and creates venues, from a chat on claude.ai, through a custom connector. The app serves an OAuth authorization server and an MCP endpoint for it, and the chat sends no photo.

### Why

A decision. An Admin with no technical skills needs a way to add events with no command line and no backoffice form.

### Check next time

Agree early which roles reach a chat channel and whether photos travel through it, since each answer changes the OAuth and the upload work.

## 2026-11-23 · Enter picks the first search suggestion

### Changed

A text submitted with Enter or the search key of the keyboard picks the first suggestion of the list, a place, an event or a venue. Before, it moved to the first place only when no event or venue matched, and else it filtered the events by text.

### Why

A client request. The visitor expects the submit to act as a tap on the first row, with no second tap in the list.

### Check next time

Agree early on what the submit of a search field does when the list mixes places and results.

## 2026-11-18 · A landing page in front of the map

### Changed

The root of the web app is now a landing page that presents the product and leads to the map in the browser or to the native app stores. The map moved from the language root to `/map`. The map links shared before the move open the map with the detail open.

### Why

A client request. A visitor first meets a page that presents the product and offers the browser or the native app.

### Check next time

Agree early whether the product needs a landing page in front of the app, since the move of the app URL needs redirects for every link already shared.

## 2026-11-18 · Phone browsers suggest the native app

### Changed

The map on a phone browser asks once to download the native app from the App Store or Google Play. The prompt shows only when the server knows the store listing of that platform.

### Why

A client request. The native app is the main way to use the product on a phone, and the web app now leads phone visitors to it.

### Check next time

Agree early whether the web app pushes phone visitors to the native app, since it changes the role of the installable web app.

## 2026-11-18 · A cluster press closes the open preview

### Changed

A press on a cluster while a preview is open closes the preview and zooms into the cluster, on the web and in the native app. Before, the clusters stayed frozen and the press changed nothing.

### Why

A client request. The visitor expects a press on a cluster to open it, whatever is open.

### Check next time

Agree how each map control behaves while a preview is open before the map interactions are built.

## 2026-11-13 · Night events count for the day before

### Changed

An event that starts in the first two hours after midnight also matches the date filter of the day before, on the web and in the native app. It still matches its own day too.

### Why

A client request. A party that starts at midnight on Sunday belongs to Saturday night for the visitor.

### Check next time

Agree where a day ends for the date filters before the search API is built, since nightlife runs past midnight.

## 2026-11-13 · A theatre shows only with a running programme

### Changed

A theatre is a pin on the map only while it holds a visible event that has not ended, on the web and in the native app. Cinemas and museums stay pins with no event, and a permanent venue with no closing days set shows that it has no closing day.

### Why

A client request. A theatre between seasons has nothing on, so a permanent pin for it misleads the visitor.

### Check next time

Agree, for each kind of permanent venue, what keeps it on the map before the permanent pins are built.

## 2026-11-12 · Permanent venues leave the default view again

### Changed

The map opens with live and upcoming pins alone on the web and in the native app. Permanent venues, like ended events, stay off until the visitor presses their chip.

### Why

A client request. The client reverses the default of 2026-11-04 for the second time, back to the rule of 2026-10-29.

### Check next time

Show the client the map with each default on real data before the pins are drawn, since this default changed three times.

## 2026-11-12 · The original photo is kept beside its dither

### Changed

Each uploaded event photo, venue cover and category image is stored as uploaded beside its two-color dither, and the event and venue details show the original on the web and in the native app. Photos stored before the change have lost their original and keep showing the dither.

### Why

A client request. The client wants the previews dithered and the details natural, and reverses the earlier rule that deleted the original once the dither was stored.

### Check next time

Agree which screens show a processed image and which the original before the upload pipeline decides what it keeps.

## 2026-11-09 · The map search follows the area in view

### Changed

The results of the map are the events inside the area that the map shows, on the web and in the native app, in place of a fixed radius around the search center. A pan or a zoom out now reaches the events of another city with no place search.

### Why

A decision. A test of the native app far from Imola showed that a zoom out never reached the events of Imola.

### Check next time

Agree whether the map searches a fixed radius or the area in view before the search API is built.

## 2026-11-04 · Permanent venues show on the map by default

### Changed

The map opens with live, upcoming and permanent pins on the web and in the native app. Only ended events stay off until the visitor presses their chip.

### Why

A client request. The client wants cinemas, museums and theatres in view from the first load, and reverses the default of 2026-10-29.

### Check next time

Agree on which kinds of result the map shows by default before the first client draws the pins.

## 2026-11-04 · Pins rank permanent venues above ended events

### Changed

A pin shows its result in the order live, upcoming, permanent, ended, on the web and in the native app. Its "+N" counts only the other live and upcoming events.

### Why

A client request. The client wants a pin to show the most relevant result, and the count to promise only events that a visitor can still attend.

### Check next time

Agree on the priority of the results that share a pin, and on what its count includes, before the first client draws the pins.

## 2026-10-29 · Galleries leave the permanent venue kinds

### Changed

A permanent venue is a cinema, a museum or a theatre, and every gallery became a museum. Setting a permanent kind now asks for the closing days of the venue.

### Why

A client request. The client keeps three permanent kinds and wants the closing days of each permanent venue on the map.

### Check next time

Agree on the list of venue kinds and the facts each kind shows before the first client draws them.

## 2026-10-29 · Kind chips hide ended events and permanent venues

### Changed

Four chips under the search field show or hide the live, upcoming, ended and permanent pins on the web and in the native app. The map opens with live and upcoming pins alone, so permanent venues no longer show under every filter.

### Why

A decision. Ended events and permanent venues crowded the map, and the pins had no legend for their colors.

### Check next time

Agree on which kinds of result the map shows by default before the first client draws the pins.

## 2026-10-28 · Event and venue pages become details over the map

### Changed

The event and venue pages are gone. Their content opens over the map, in a side panel on a wide screen and in a tall sheet on a phone, on the web and in the native app. The rework rebuilt both pages and the links to them on both clients.

### Why

A client request. The client wants the visitor to keep the map in view while reading an event, and rejected the panel that docked every preview on the right.

### Check next time

Agree on whether the detail of an entity is a page or a layer over the main view before the first client builds it.

## 2026-10-23 · A native app joins the web app

### Changed

The scope adds a native app for iOS and Android with the public features of the web app, no sign-in and no backoffice. It calls the API of the web app and ships through the stores.

### Why

A client request. The client asked for a native app with the features of the public web app, beside the web app that installs on the home screen.

### Check next time

Ask whether the product needs store apps before the estimate. They add the store accounts, a release path on a Mac and a second client to keep in step with the API.

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
