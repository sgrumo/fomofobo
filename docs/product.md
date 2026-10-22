---
standard: draft
title: fomofobo
summary: Mobile-first web app that shows events around a place on a map, with a backoffice where organizers publish them.
---

## Overview

fomofobo is a responsive, mobile-first web app for finding events around a place. Visitors open it with no account, see the events of the coming days as pins on a map, and narrow them by name, place, category and date. Each event has a page that a visitor can open directly or share. Organizers publish their events through a backoffice in the same app, and publishing needs no approval. Admins supervise the organizers, block organizers or events, and manage the shared catalogue of categories. The app installs on the home screen and keeps the events already loaded viewable offline.

## Perimeter

### Categories

A category groups events by type and carries a unique name and an icon. The icon marks the category on the filter chips and on the map pins. An Admin can give a category an image, stored as a two-color dither like every photo. Only Admins create, edit and delete categories, and the app refuses to delete a category that an event or a permanent venue uses.

### Venues

A venue is a reusable place with a name, an address and coordinates, and an optional description, cover and website, Instagram and Facebook links. Every event takes place at exactly one venue, and events share venues. The backoffice takes the address and the coordinates of a venue from the place search, and a pin on the map corrects the position.

An Organizer owns one venue at most, and creates and edits only that venue. An Admin creates every other venue, edits every venue, and gives a venue to an Organizer or takes it back. Any Organizer holds events at any venue.

An Admin gives a venue a permanent kind: cinema, museum, theatre or gallery. A permanent venue carries one link to its programme outside the app and one category, and only Admins edit it, so it has no owner. A venue with an owner keeps the regular kind until the Admin takes the owner away.

An Admin blocks a venue with a reason. A blocked venue can no longer be picked for an event, and the events already held there keep it and stay visible. A blocked venue loses its public page, and its events show its name with no link.

### Events

An event has a title, one or more categories, one venue, a start and an end, an ordered photo gallery whose first photo is the cover, optional Instagram and Facebook links, a price scheme, an optional capacity and an owning organizer.

The price scheme says whether the event is free or paid. A paid event has a full price, reduced prices with a label each, or notes alone. Free or paid, an event can require a membership card with an optional cost, and a minimum age. Amounts are in euro. The public app sums the scheme up in one line, such as "da 5 €" or "Gratis · Tessera richiesta · 18+", and a paid event with no amount shows its notes. The capacity is the number of places, shown and never enforced. The end is later than the start and can fall on the next day. An event holds up to ten photos, none at all included, and the account that writes the event uploads them. An event with no photo takes the cover of its venue, else the image of its primary category, else a generated image of the category icon, in the preview, on its page and in link previews. Each photo is stored as a two-color dither, at most 1200 pixels wide.

### Recurrence and occurrences

An event is single or repeating. A repeating event follows a weekly or monthly rule from its first date up to an end date, plus added dates outside the rule, minus removed dates of the rule. Each resulting date is an occurrence with the start and end times of the event, and status, date filters and countdowns work per occurrence.

A weekly rule repeats on a set of weekdays. A monthly rule repeats on the day of the month of the first date, or on its nth weekday, such as the second Wednesday. A month without that day or that weekday has no occurrence, and the first date is always an occurrence unless the removed dates list it.

Occurrences keep their wall-clock times across a change of daylight saving time, in the time zone of the platform. An event holds at most 366 occurrences, and the app refuses a save past that limit.

### Status

An occurrence is upcoming before its start, live from its start until its end, and ended from its end on. The app computes the status from the current time.

### Visibility

An event and all its occurrences are visible only when neither the event nor its organizer is blocked. A hidden event is absent from every part of the public app, saved events included, from the next request on. Saving an event in the backoffice publishes it at once.

An occurrence stays visible for the retention days of the platform settings after its end, three by default, then leaves the public app, its page and the saved list included. With zero days it leaves at its end. A repeating event stays visible through its other occurrences.

### Retention

Once every occurrence of an event ended more than the retention days ago, a daily job deletes the photos of the event from the bucket, to cut the storage cost. The database keeps the event and its occurrences for statistics, and the backoffice still lists the event.

### Search area

The search center is the position of the device when the visitor grants location, else a default city until the visitor picks a place. Only occurrences at venues inside a fixed radius around the search center are results. The app shows no distance to an event.

### Map

Each venue with results is one pin. The pin shows the result of the venue with the highest status, in the order live, upcoming, ended, permanent. It takes the icon of that category and the look of that status. A tag above the pin reads live for a live result, the start time for an upcoming result of today, and the date for an upcoming result of another day. When the venue holds more results, the tag adds their count as "+N".

Venues too close to tell apart merge into a cluster that counts the venues. Its ring shows the share of venues whose pin is live, upcoming, ended or permanent. Live pins draw above every other pin, and permanent venues below every event. The position of the visitor draws above every pin and cluster.

Every permanent venue inside the search area is a pin of its own color, whatever the date filter, with the icon of its category and its kind as the tag. Its preview shows the kind, the cover, the name and the address, with a link to the programme and one to the venue page. When a permanent venue also holds events, the preview pages through the events first and the venue last.

A tap on a pin opens a preview of the occurrence. The preview shows status, venue, categories, price and times, with the elapsed time when live and a link to the event page. The pin of a venue with more results opens the preview of its result, which pages through every result of the venue.

### Search and filters

Results match every active filter. A permanent venue ignores the date filter, and the free filter leaves it out, since it has no price. One search field matches event titles and the names of the venues in the area, and sets a place as the search center. A venue result opens the page of the venue, and permanent venues come in a group of their own. Category chips select one category at a time and show the result count of each category under the other filters, permanent venues included. With no category chip pressed, the results hold every category. The date filter offers today, tomorrow, weekend and a custom range, with a default window of today and the following days. A "Gratis" chip keeps the events marked free, membership card or not. On a phone, the category, date and price chips sit in a panel that a filter button opens.

### Event page

Each event has its own URL, and for a repeating event the URL refers to one occurrence. The page offers directions to the venue, the external link of the event and a save action. It shows the price summary, the capacity and the count of interested visitors, and lists every price, the membership card, the minimum age and the notes when the scheme holds more than one price line. Directions open Apple Maps on iOS and iPadOS, and Google Maps elsewhere.

Share opens the share sheet of the device, or copies the link where none exists. A row of links shares the page on WhatsApp, Telegram, Facebook and X with its title, date, time and venue, and a button copies the link. A shared link shows a card with the title, the cover, and the description of the event or else its date, time and venue.

### Venue page

Each venue has its own URL, and the event page and the map preview link to it. The page shows the profile of the venue, directions to it and its links, with the share row of the event page. The page of a permanent venue also shows its kind and the link to its programme.

The page lists the upcoming events of the venue, one row for each event at its next occurrence, live events first. A row opens the event page. Below, the past events of the venue list their title and their first and last date, with no photo, newest first and in numbered pages.

### Saved events

Visitors save events with no account. The saved list lives on the device and shows only the visible events. A saved event stays in the list until the visitor removes it, or until the retention days after it ends.

Each save and unsave also reaches the server under a random id of the device, which names no one. The server counts each device once for each occurrence. A change made offline waits on the device and leaves once the connection is back. On its first visit after the counts started, a device sends the saves that it already held.

Each IP sends 60 save changes every 10 minutes at most. Past that limit, the change waits on the device for a later send.

### Installation and offline use

The app installs on the home screen and opens full-screen on the map. Browsers with an install prompt get an install button on the saved list, and iOS gets the steps of the share sheet.

Offline, the pages, events, photos and map areas that the device already loaded stay viewable. A reopened map shows the last results of the same filters, and a new filter, a place search or an area never loaded needs a connection. A page never opened online shows an offline notice.

The saved list works offline for every saved event that the device showed online at least once. The backoffice is not part of the installed app and always needs a connection.

### Backoffice access

Organizers and Admins sign in with email and password, and nobody registers on their own. A blocked organizer cannot sign in and loses every open session at once.

An Admin creates an organizer account with a temporary password and hands it over. When an organizer loses the password, an Admin sets a new one, which ends every open session of the account. The app sends no email.

Admin accounts come from a command-line tool that runs against the database. No Admin creates or manages another Admin in the app.

### Event management

Organizers see, create, edit and delete only their own events, and the event of another organizer does not exist for them. Admins see every event with its organizer, and create, edit and delete any event for an organizer that they pick. Admins block any event with a reason and unblock it, and an edit by the organizer keeps the block.

A deleted event leaves the app and the backoffice, and its photos leave the public bucket.

The backoffice page of an event lists each occurrence that has not ended with its count of saves, under the participant threshold too. The organizer of the event and every Admin see it.

The event form opens as a wizard of five steps: basics, place and time, photos, details, and a review that saves. A later step opens only once every step before it is complete, and the user can always go back. The user can switch to the full form at any time, and the device remembers the choice.

### Organizer management

Admins create organizer accounts with a name and an email, and block or unblock them. Admins see every event, organizer, venue and category of the platform, with the blocked state of events, organizers and venues. The only statistic of the backoffice is the count of saves of an event.

### Platform settings

An Admin sets the retention days of ended events, from 0 to 90, and the participant threshold, from 1 to 1000. The backoffice shows who saved them last and when. Until an Admin saves them, the defaults apply: three days and a threshold of 20. A larger value brings back events that ended before it, without the photos already deleted.

The event page and the map preview show the count of saves of an occurrence once it reaches the participant threshold. Under the threshold the public app shows no count.

## Architecture and integrations

- One Next.js application serves the public app, the event pages and the backoffice, because the analysis keeps them in one program. The app speaks Italian alone. The public app keeps the language segment `/it/` in its URLs, so a second language needs no route move, and the backoffice lives under `/backoffice`.
- Server Components and route handlers serve the public reads, and Server Actions carry the backoffice writes.
- Turso, a hosted libSQL database (SQLite), holds categories, venues, events, occurrences and accounts. Occurrences are stored as rows, because the map search filters them by time window and by area.
- Cloudflare R2 holds the event photos in a public bucket, because shared and offline pages need a stable photo URL. The backoffice resizes and dithers each photo in the browser, then uploads the 1-bit PNG straight to the bucket, because a dither on the server would spend the CPU budget of the free plan.
- A daily GitHub workflow runs the photo purge job against the database and the bucket of each environment, on the branch of that environment. The job is a program of its own, so it lives in its own app and not in the Next.js application.
- Geoapify: place suggestions of the search field, from all of Italy, with the places nearest to the search center first. Each client gets 30 calls a minute, because the free plan has a daily credit limit.
- OpenFreeMap: the tiles of the event map. The device keeps at most 500 viewed tiles, because the provider caps an offline download at 3,000 tiles.
- A service worker of the public app keeps what a visitor loaded and serves it offline. It sends the backoffice, the sign-in and every write straight to the network, because a worker at the root of the site controls the backoffice pages too.
- The Next data cache holds the shared public reads: the categories, the event pages and the place suggestions. Every backoffice write expires its entries at once, because a block must hide an event on the next request. The save counts stay out of it, because each save would expire the event page.
- Authentication runs inside the app with database sessions, because Admins create accounts and a block must end every open session at once. Every backoffice API call reads the session from the database, so a block applies on the next call.
- Deploy: the app runs on Vercel, in the region of its Turso database. Every service runs on its free plan. The Vercel Hobby plan admits non-commercial use only.
