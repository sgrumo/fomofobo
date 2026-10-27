---
name: add-event
description: Adds an event to fomofobo through the backoffice API, from a flyer, a photo or a text. Use when the user asks to add, create or publish an event, or shares an event flyer to add.
argument-hint: "[local|dev|prod] <flyer file or event details>"
user-invocable: true
---

# Add an event

$ARGUMENTS

The `backoffice-cli` helper sends each call to the backoffice API as the account of its env file. The server applies the backoffice rules: the session, the role and every field check. A call creates real data in the environment that it targets.

Run every command from the repo root. `pnpm -s backoffice` with no arguments prints the usage.

## Set up

1. Pick the environment. If the user names none, ask: local, dev or prod.
2. Set `ENV_NAME=<env>` on every command for dev and prod. Leave it out for local, which reads `.env.local`.
3. If the command fails with "invalid environment", tell the user to copy `scripts/backoffice-cli/.env.template` to the file that the error names, and to fill it. Do not ask for the password in the chat, and do not open the env file.
4. Run `pnpm -s backoffice request GET /api/backoffice/me`. Make sure that it answers `HTTP 200`, and note the `role`.

## Steps

1. Read the event facts from the source: title, dates and times, venue, categories, price, capacity, links and description. List each fact that the source does not give.
2. Read `eventUpsertSchema` in `packages/models/src/events.ts`, and the schemas that it imports. They are the spec of the request body.
3. Find the venue with `GET /api/backoffice/venues?q=<name>`. If no venue matches, go to [A new venue](#a-new-venue).
4. Find the categories with `GET /api/public/categories`. Pick the primary category for the pin icon.
5. If the role is `admin`, find the organizer with `GET /api/backoffice/organizers?q=<name>`. If the user named none, ask. If the role is `organizer`, leave out `organizerId`: the server answers `403` to it.
6. If the user gives a photo file, run `pnpm -s backoffice upload-photo <absolute path>` for each photo, in gallery order. Put each printed `key` in `photoKeys`.
7. Ask the user about each missing fact that the schema requires, such as the end time. Do not invent a value.
8. Write the body to a JSON file in the scratchpad directory.
9. Show the user a summary: environment, title, dates, venue, organizer, categories, price, photos. Wait for a clear yes.
10. Run `pnpm -s backoffice request POST /api/backoffice/events --body-file <file>`.
11. If it answers `HTTP 400`, read the error body and fix the field. If the fix changes a fact that the user approved, ask again.

Done when the `POST` answered `HTTP 201`, and you gave the user the event id and the backoffice path `/backoffice/events/<id>`.

## Facts the schema does not show

- `startsAt` and `endsAt` are wall-clock times with no offset, in `PLATFORM_TIME_ZONE` of `packages/domain/src/platform.ts`. Write the time of the flyer as it reads, as `YYYY-MM-DDTHH:mm` with no seconds.
- Amounts are euro cents. "5 €" is `500`.
- A flyer with one date and several times is one event with a recurrence, or several events. Ask the user which.
- An image pasted in the chat has no file that the helper can read. Ask the user for its path, or add the event with no photo.
- The dither reads JPEG, PNG and WebP. If the photo is HEIC, convert it first on macOS: `sips -s format jpeg <in>.heic --out <scratchpad>/<name>.jpg`.

## A new venue

1. Ask the user before you create a venue.
2. Search the address with `GET /api/public/places?q=<address>&lat=<lat>&lng=<lng>`. Use the coordinates of the city as the center.
3. Read `venueCreationSchema` in `packages/models/src/venues.ts`, and build the body from the place that the user picks.
4. Run `POST /api/backoffice/venues` with the body file. Use the `id` of the answer in the event.
5. If the user gives a cover photo, upload it with `upload-photo <file> --ticket /api/backoffice/venues/<id>/cover/upload-ticket`, then send its key as `coverPhotoKey` in `PATCH /api/backoffice/venues/<id>`.

Done when the venue answered `HTTP 201` and its `id` is in the event body.
