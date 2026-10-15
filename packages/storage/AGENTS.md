# Storage package

Thin Drizzle DB access layer. Schema lives in `src/db-schema.ts`.

Before you write a table, a storage class, or a query, invoke `/storage-patterns`. It holds the conventions and the patterns for this package.

## Comments

A table, a column, or an enum value gets no comment by default. The name and the type say what it holds: `note` is the note of the row.

Write a comment only when a reader who knows the domain would use the column wrong without it. The comment states the trap in one sentence. Two cases qualify:

- `NULL` or an empty default means something other than "not set". For example, `NULL` falls back to another column.
- The table shape is odd on purpose, and the obvious fix breaks stored rows.

Leave out these comments:

- What the name or the type says.
- Who reads or writes the column, or what a feature does with it.
- The reason for an obvious `NOT NULL`, default, or key.
- History: what the column replaced, what a migration did, or which rows came before it. A migration holds that.
- A citation of a spec, a workbook, or a section.
- A reference to another comment, such as "like X above".

## Migrations

### Flow

1. Run `pnpm db:gen-migration`. If one scope both gains and loses an item, it shows a rename prompt. Examples are a column added and a column dropped in one table, or a table added and a table dropped. In that case, ask the user to run it and to pick the right option at each prompt.
2. If the command does not write a new migration or does not stop, it waits for a prompt. Stop it and ask the user to run it.
3. Read the generated `.sql` file. If it fails or loses data by accident on the rows that exist, edit it. If it drops data on purpose, tell the user.

Always start from the generated file. Do not write a schema migration by hand.

A migration needs no follow-up after the commit. Each deploy applies it, and the E2E suites push the current schema. The user applies migrations to their local dev database on their own.

### Rules for an edit

- Edit only the `*.sql` files. Never edit `migrations/meta/`.
- The final schema after the edit must be the same as the snapshot. Otherwise the next generated migration is wrong.
- A committed migration is history. Never edit it. If it needs a fix, put the fix in a new migration.

### Data migrations

A data migration changes rows and not the schema. Run `pnpm db:custom-migration` to get an empty migration for it.

Migrations run in the order of their creation. If the data migration needs a schema change, generate the schema migration first.
