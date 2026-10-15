---
name: api-patterns
description: "Patterns for the API layers: route definitions, routers, services, error codes. Also what goes in each layer, and how a service composes reads and writes. Use when you add or change an endpoint, a router, or a service."
user-invocable: true
---

## API patterns

$ARGUMENTS

A request crosses four layers: the route definition, the router, the service, and the storage. Each layer does one job. A rule that sits in the wrong layer gets copied there by the next change, so the table below decides where code goes.

The reference implementation is the todo domain: `packages/api-routes/src/todo-routes.ts`, and `todo-router.ts` and `todo-service.ts` in the routers and the services folders of the app. If this file and that code disagree, read the code and report the drift.

`<api-app>` below is the app that serves the API. Every app that mounts `backend-shared/http` follows this file.

| Task                                            | Section                                       |
| ----------------------------------------------- | --------------------------------------------- |
| Decide where a piece of code goes               | [Layers](#layers)                             |
| Add or change a route                           | [Route definitions](#route-definitions)       |
| Add or change a handler                         | [Routers](#routers)                           |
| Add or change a service method                  | [Services](#services)                         |
| Read data from more than one table              | [Reads across tables](#reads-across-tables)   |
| Write more than one row for one operation       | [Writes across tables](#writes-across-tables) |
| Clean up a service that grew one query per need | [Refactor a fan-out](#refactor-a-fan-out)     |
| Add an endpoint from scratch                    | [Add an endpoint](#add-an-endpoint)           |

### Layers

| Layer            | Does                                                                                         | Never                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Route definition | Declares the path, the method, the request and response schemas, and every status            | Holds logic                                                                                                          |
| Router           | Reads the validated input, calls **one** service method, answers with `respond`              | Branches on data, maps a `null` to a 404, maps or filters data, calls a second service, reads storage, logs an event |
| Service          | Holds the domain rules: decisions, ids, errors, the choice of the storage method             | Builds a batch, calls storage in a loop, filters or joins rows in JS, runs two writes for one operation              |
| Storage          | Runs the queries that `/storage-patterns` describes, one method per read or per atomic write | Decides whether a write happens                                                                                      |

When a router needs an `if`, the decision belongs to the service. When a service needs a second storage call for the same response, the read belongs to storage as one query.

### Route definitions

Each domain has one file in `packages/api-routes/src/<domain>-routes.ts`. It exports one `XxxRoutes` object.

```typescript
import { createRoute, z } from "@hono/zod-openapi"
import { itemCreationSchema, itemSchema } from "models"

import { badRequestResponse, notFoundResponse } from "./lib/common-responses"

export const ItemRoutes = {
    create: createRoute({
        method: "post",
        path: "/api/items",
        request: {
            body: {
                required: true,
                content: { "application/json": { schema: itemCreationSchema } },
            },
        },
        responses: {
            201: {
                content: { "application/json": { schema: itemSchema } },
                description: "Item created",
            },
            400: badRequestResponse,
        },
        tags: ["Items"],
        summary: "Create item",
    }),

    getById: createRoute({
        method: "get",
        path: "/api/items/{id}",
        request: {
            params: z.object({ id: z.uuid().openapi("Item ID") }),
        },
        responses: {
            200: {
                content: { "application/json": { schema: itemSchema } },
                description: "Item retrieved",
            },
            404: notFoundResponse("Item"),
        },
        tags: ["Items"],
        summary: "Get item by ID",
    }),
}
```

- Prefix each path with `/api/<domain>`.
- Declare every status the handler can answer. Build the error responses with `badRequestResponse`, `notFoundResponse(entity)` and `conflictResponse(description)` from `./lib/common-responses`.
- Put query parameters in `request.query` as a Zod object.
- A read that needs a body uses `method: "query"`. It must not change state, its body schema uses no `z.coerce`, and the frontend calls it with `bodyfulQueryEndpoint`. If the criteria fit in a URL, use `get`.

### Routers

Each domain has one router in the routers folder of the app: `<domain>-router.ts`.

```typescript
router.openapi(ItemRoutes.getById, async c => {
    try {
        const id = c.req.valid("param").id
        const item = await service.getItem(id)
        return respond(c, ItemRoutes.getById, HttpStatus.Ok, item)
    } catch (error) {
        throw toApplicationError(error, "Error fetching item")
    }
})
```

- A handler has three lines of work: read the input with `c.req.valid(...)`, call one service method, answer.
- Answer JSON with `respond(c, Route, HttpStatus, data)`. It validates the answer against the route schema.
- Answer `204 No Content` with `c.body(null, HttpStatus.NoContent)`.
- Wrap each body in try/catch and rethrow through `toApplicationError(error, "context")`.
- A router takes the services of its own domain. If a handler needs data of two domains, one service method returns it.
- Never check a result for `null` in the router. The service throws the error, and the app maps its code to a status.

### Services

Each domain has one service in the services folder of the app: `<domain>-service.ts`.

```typescript
export class ItemService {
    private readonly itemStorage: ItemStorage
    public constructor(itemStorage: ItemStorage) {
        this.itemStorage = itemStorage
    }

    /**
     * @description Fetches one item, or throws when no row matches the id
     * @param id Item read
     */
    public async getItem(id: string): Promise<Item> {
        const item = await this.itemStorage.getItem(id)
        if (!item) {
            throw appError("ItemNotFound", `Item with id ${id} not found`)
        }
        return item
    }
}
```

- The service holds every domain rule: validations, decisions, computed fields, the id of a new row.
- Storage returns `null` when no row matches. The service decides whether that is an error.
- Throw a business error with `appError("Code", "message")`. A new code goes in the `AppErrorCode` union of `errors.ts` and in `mapErrorStatus` of the app.
- A business outcome that the client must tell apart, such as a conflict, is an error code. The router never picks the status.

### Reads across tables

A response that needs rows of related tables comes from one storage read. Related means the rows share a key: an order and its customer, a project and its time entries.

- Join the parents, aggregate the children in a subquery or with `json_group_array`, and compute sums and counts in SQL. `complex-reads.md` of `/storage-patterns` shows the shape.
- `Promise.all` runs reads that share no key, such as two unrelated lists on one page. It never runs two reads of the same entity.
- Never call storage once per row. A `getById` or a `listForX` in a loop becomes one read with `inArray`.
- Never load a table to filter, join, group or sum it in JS. The `WHERE`, the join and the aggregate go in the query.
- A new field on a response extends the read that already serves it. Never add a storage call beside it.

### Writes across tables

An operation that writes more than one row calls one storage method. That method runs the writes in one D1 batch. See Batches in `/storage-patterns`.

- Two awaited writes in one service method mean a batch is missing. Move them into one storage method named for what it writes.
- A write per row in a loop becomes one bulk write.
- A value computed from other rows, such as the next sort index, is computed in the write query. A read and then a write lets two requests take the same value.
- A call to object storage or to another service is not part of the batch. Run it after the DB write. A failure then leaves an unused object, not a row that points to nothing.

### Refactor a fan-out

A service method that awaits three or more storage reads, or a `Promise.all` of reads keyed on one id, has grown one query per need. To clean it up:

1. List each read with its table and its key.
2. Group the reads that share a key.
3. Write one storage read per group: joins for one-to-one rows, an aggregate subquery or `json_group_array` for one-to-many rows.
4. Map the result in one mapper, and keep the response schema the same.
5. Delete each storage method that has no caller left.
6. Run the E2E suite of the app. The response must not change.

### Add an endpoint

1. Write the models. See `packages/models/AGENTS.md`.
2. Write the route definition. See [Route definitions](#route-definitions).
3. Write the storage method. See `/storage-patterns`.
4. Write the service method. See [Services](#services).
5. Write the handler. See [Routers](#routers).
6. Wire a new router or a new service where the app builds its server: build the storage, the service and the router, and mount the router with `app.route("/", router)`.
7. Write the E2E tests. See `e2e/AGENTS.md`.
8. Run `pnpm checklist`, then the E2E suite of the app.
