# Models package

Zod schemas and types. A domain entity belongs here, even when only one package uses it today. A shape that two packages must agree on belongs here too. Everything else stays with its owner.

A shared type needs no schema. Import `z` from `"@hono/zod-openapi"`. Never call `.openapi()` here.

A schema exports its type as `export type X = z.infer<typeof xSchema>`. The type stays on the line directly below the schema, with no empty line between them.

## Layout

`src/` holds one file for each domain entity. `src/lib/` holds the generic files that no entity owns:

- A factory that builds a schema from another schema.
- A wrapper that adds a rule to a schema.
- A shape that other schemas build on.
- A value format, such as a version string, a currency or a unit of measurement, when it is not a domain entity of its own.

One rule decides the folder. If the file describes a domain entity, it goes in `src/`. Otherwise it goes in `src/lib/`, whoever imports it.

`src/index.ts` re-exports both folders. A consumer imports from `"models"` and never sees the split.

## No logic

A schema describes a shape. A function that derives a value is logic. Logic leaves this package.

The caller decides where the logic goes:

- If one app calls it, move it to that app.
- If two or more apps call it, move it to a shared package that both apps import.
- If it reads or writes the database, move it to the storage layer.
- If it talks to an external system, move it to the package that owns that integration.

If no such package exists, ask the user before you create one.

A file in `src/` exports schemas and types only. An exported function there is a mistake. A factory or a wrapper goes in `src/lib/`. Anything else leaves the package.

## Comments

A schema, a field, or an enum value gets no comment by default. The name and the type say what it holds: `note` is the note of the entity.

Write a comment only when a reader who knows the domain would use the declaration wrong without it. The comment states the trap in one sentence. Two cases qualify:

- An empty value means something other than "not set". For example, `null` falls back to another field.
- The shape is odd on purpose, and the obvious fix breaks stored data.

Leave out these comments:

- What the name or the type says.
- Who reads or writes the field, or what a feature does with it.
- The reason for an obvious constraint, default, or nullability.
- History: what the field replaced, or which rows came before it.
- A citation of a spec, a workbook, or a section.
- A reference to another comment, such as "like X above".

## Custom errors

A `refine` never sets `error`. An `error` string overrides the error map of every consumer.

Add each new code to `customErrorCodeSchema`. Write the code in kebab-case, one code for each distinct failure. Pass the code through the params of the `refine`:

```ts
.refine(check, { params: customErrorParamsSchema.encode({ errorCode, message }) })
```

`errorCode` is the typed code that a consumer maps to its own wording. `message` is the fallback sentence, shown when no consumer maps the code.
