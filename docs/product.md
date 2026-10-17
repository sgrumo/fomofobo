---
standard: draft
title: fomofobo
summary: Mobile-first web app that shows events around a place on a map, with a backoffice where organizers publish them.
---

## Overview

fomofobo is a responsive, mobile-first web app for finding events around a place. Visitors open it with no account, see the events of the coming days as pins on a map, and narrow them by name, place, category and date. Each event has a page that a visitor can open directly or share. Organizers publish their events through a backoffice in the same app, and publishing needs no approval. Admins supervise the organizers, block organizers or events, and manage the shared catalogue of categories. The app installs on the home screen and keeps the events already loaded viewable offline.

## Perimeter

### Categories

A category groups events by type and carries a unique name and an icon. The icon marks the category on the filter chips and on the map pins. Only Admins create, edit and delete categories, and the app refuses to delete a category that an event uses.

### Venues

A venue is a reusable place with a name, an address and coordinates. Every event takes place at exactly one venue, and events share venues. Organizers and Admins create venues, and only Admins edit them.

### Events

An event has a title, one or more categories, one venue, a start and an end, an ordered photo gallery whose first photo is the cover, optional Instagram and Facebook links, an optional price in free text and an owning organizer. The public app shows an event with no price as free. The end is later than the start and can fall on the next day. An event holds one to ten photos, and the account that writes the event uploads them.

### Recurrence and occurrences

An event is single or repeating. A repeating event follows a weekly or monthly rule from its first date up to an end date, plus added dates outside the rule, minus removed dates of the rule. Each resulting date is an occurrence with the start and end times of the event, and status, date filters and countdowns work per occurrence.

A weekly rule repeats on a set of weekdays. A monthly rule repeats on the day of the month of the first date, or on its nth weekday, such as the second Wednesday. A month without that day or that weekday has no occurrence, and the first date is always an occurrence unless the removed dates list it.

Occurrences keep their wall-clock times across a change of daylight saving time, in the time zone of the platform. An event holds at most 366 occurrences, and the app refuses a save past that limit.

### Status

An occurrence is upcoming before its start, live from its start until its end, and ended from its end on. The app computes the status from the current time.

### Visibility

An event and all its occurrences are visible only when neither the event nor its organizer is blocked. A hidden event is absent from every part of the public app, saved events included, from the next request on. Saving an event in the backoffice publishes it at once.

### Search area

The search center is the position of the device when the visitor grants location, else a default city until the visitor picks a place. Only occurrences at venues inside a fixed radius around the search center are results. Distance on an event is measured from the position of the device to the venue.

### Map

Each result is a pin at its venue with the icon of its category, and its look follows the status. Pins too close to tell apart merge into a cluster with a count. A status bar shows the current date, the number of live results and the number of upcoming results of today.

A tap on a pin opens a preview of the occurrence. The preview shows status, remaining time when live, venue, categories, distance, price and times, with a link to the event page. When several results share one venue, the preview pages through them.

### Search and filters

Results match every active filter. One search field matches event titles and sets a place as the search center. Category chips select one category at a time and show the result count of each category under the other filters. The date filter offers today, tomorrow, weekend and a custom range, with a default window of today and the following days.

### Event page

Each event has its own URL, and for a repeating event the URL refers to one occurrence. The page offers directions to the venue, the external link of the event and a save action. Share opens the share sheet of the device, or copies the link where none exists. Directions open Apple Maps on iOS and iPadOS, and Google Maps elsewhere.

### Saved events

Visitors save events with no account. Saved events stay on the device only, and the saved list shows only the visible ones. A saved event stays in the list after it ends, until the visitor removes it.

### Installation and offline use

The app installs on the home screen and opens full-screen. Offline, the events and photos already loaded stay viewable, and new searches, filter changes and new map areas need a connection. The backoffice is not part of the installed app. (not built)

### Backoffice access

Organizers and Admins sign in with email and password, and nobody registers on their own. A blocked organizer cannot sign in and loses every open session at once.

An Admin creates an organizer account with a temporary password and hands it over. When an organizer loses the password, an Admin sets a new one, which ends every open session of the account. The app sends no email.

Admin accounts come from a command-line tool that runs against the database. No Admin creates or manages another Admin in the app.

### Event management

Organizers see, create, edit and delete only their own events, and the event of another organizer does not exist for them. Admins see every event with its organizer, and create, edit and delete any event for an organizer that they pick. Admins block any event with a reason and unblock it, and an edit by the organizer keeps the block.

A deleted event leaves the app and the backoffice, and its photos leave the public bucket.

### Organizer management

Admins create organizer accounts with a name and an email, and block or unblock them. Admins see every event, organizer, venue and category of the platform, with the blocked state of events and organizers. The backoffice shows no statistics.

## Architecture and integrations

- One Next.js application serves the public app, the event pages and the backoffice, because the analysis keeps them in one program. The public app lives under a language segment of the URL, and the backoffice lives under `/backoffice` in one language.
- Server Components and route handlers serve the public reads, and Server Actions carry the backoffice writes.
- Turso, a hosted libSQL database (SQLite), holds categories, venues, events, occurrences and accounts. Occurrences are stored as rows, because the map search filters them by time window and by area.
- Cloudflare R2 holds the event photos in a public bucket, because shared and offline pages need a stable photo URL. The backoffice uploads the photos straight to the bucket.
- Geoapify: place suggestions of the search field, from all of Italy, with the places nearest to the search center first. Each client gets 30 calls a minute, because the free plan has a daily credit limit.
- OpenFreeMap: the tiles of the event map.
- The Next data cache holds the shared public reads: the categories, the event pages and the place suggestions. Every backoffice write expires its entries at once, because a block must hide an event on the next request.
- Authentication runs inside the app with database sessions, because Admins create accounts and a block must end every open session at once. Every backoffice API call reads the session from the database, so a block applies on the next call.
- Deploy: the app runs on Vercel, in the region of its Turso database. Every service runs on its free plan. The Vercel Hobby plan admits non-commercial use only.
