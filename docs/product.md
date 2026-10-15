---
standard: draft
title: fomofobo
summary: Mobile-first web app that shows events around a place on a map, with a backoffice where organizers publish them.
---

## Overview

fomofobo is a responsive, mobile-first web app for finding events around a place. Visitors open it with no account, see the events of the coming days as pins on a map, and narrow them by name, place, category and date. Each event has a page that a visitor can open directly or share. Organizers publish their events through a backoffice in the same app, and publishing needs no approval. Admins supervise the organizers, block organizers or events, and manage the shared catalogue of categories. The app installs on the home screen and keeps the events already loaded viewable offline.

## Perimeter

### Categories

A category groups events by type and carries a name and an icon. The icon marks the category on the filter chips and on the map pins. Only Admins create and edit categories. (not built)

### Venues

A venue is a reusable place with a name, an address and coordinates. Every event takes place at exactly one venue, and events share venues. (not built)

### Events

An event has a title, one or more categories, one venue, a start and an end, an ordered photo gallery whose first photo is the cover, optional Instagram and Facebook links, an optional price and an owning organizer. The end is later than the start and can fall on the next day. (not built)

### Recurrence and occurrences

An event is single or repeating. A repeating event follows a weekly or monthly rule from its first date up to an end date, plus added dates outside the rule, minus removed dates of the rule. Each resulting date is an occurrence with the start and end times of the event, and status, date filters and countdowns work per occurrence. (not built)

### Status

An occurrence is upcoming before its start, live between its start and its end, and ended after its end. The app computes the status from the current time. (not built)

### Visibility

An event and all its occurrences are visible only when neither the event nor its organizer is blocked. A hidden event is absent from every part of the public app, saved events included. Saving an event in the backoffice publishes it at once. (not built)

### Search area

The search center is the position of the device when the visitor grants location, else a default city until the visitor picks a place. Only occurrences at venues inside a fixed radius around the search center are results. Distance on an event is measured from the position of the device to the venue. (not built)

### Map

Each result is a pin at its venue with the icon of its category, and its look follows the status. Pins too close to tell apart merge into a cluster with a count. A status bar shows the current date, the number of live results and the number of upcoming results of today. (not built)

### Search and filters

Results match every active filter. One search field matches event titles and sets a place as the search center. Category chips show the result count of each category under the other filters, and the date filter offers today, tomorrow, weekend and a custom range, with a default window of today and the following days. (not built)

### Event page

Each event has its own URL, and for a repeating event the URL refers to one occurrence. The page offers directions to the venue, the external link of the event and a save action. Share opens the share sheet of the device, or copies the link where none exists. (not built)

### Saved events

Visitors save events with no account. Saved events stay on the device only, and the saved list shows only the visible ones. (not built)

### Installation and offline use

The app installs on the home screen and opens full-screen. Offline, the events and photos already loaded stay viewable, and new searches, filter changes and new map areas need a connection. The backoffice is not part of the installed app. (not built)

### Backoffice access

Organizers and Admins sign in with email and password, and nobody registers on their own. Admins create organizer accounts. A blocked organizer cannot sign in and loses every open session at once. (not built)

### Event management

Organizers see, create, edit and delete only their own events. Admins see every event with its organizer and block or unblock any of them. (not built)

### Organizer management

Admins create organizer accounts with a name and an email, and block or unblock them. Admins see every event, organizer, venue and category of the platform, with the blocked state of events and organizers. (not built)

## Architecture and integrations

- One Next.js application serves the public app, the event pages and the backoffice, because the analysis keeps them in one program. The public app lives under a language segment of the URL, and the backoffice lives under `/backoffice` in one language.
- Server Components and route handlers serve the public reads, and Server Actions carry the backoffice writes.
- Cloudflare D1 holds categories, venues, events, occurrences and accounts. Occurrences are stored as rows, because the map search filters them by time window and by area.
- Cloudflare R2 holds the event photos, uploaded from the backoffice straight to the bucket.
- Authentication runs inside the app with database sessions, because Admins create accounts and a block must end every open session at once.
- Deploy: the app runs on Cloudflare Workers through the OpenNext adapter.
