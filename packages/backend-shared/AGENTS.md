# backend-shared package

The shared backend layer. Every app that serves an API mounts it: the logger and the
object storage at the root, the HTTP layer under `/http`, and the env schema builders under
`/config`. `/photos` holds the `sharp` dither of a stored photo, for the Node scripts that
write photos. The Next app never imports it: the backoffice dithers in the browser.

## The HTTP layer

`src/http/` holds `respond()`, `createRouter()`, `loggerMiddleware`, `handleErrors()` and
`createErrorUtils()`. The last one binds `appError`, `toApplicationError` and
`handleRouteNotFound` to the error union of one app.

Every app that mounts this layer follows the same conventions:

- **Errors**: one `AppErrorCode` union per app, declared in its own `errors.ts`, which destructures the three bound helpers. Throw through `appError(code, message)`. Map the union to status codes with an exhaustive `ts-pattern` match, where the app builds its server
- **Route error handling**: wrap each handler body in try/catch, and rethrow through `toApplicationError(error, "context message")`
- **Response validation**: answer with `respond(c, Route, HttpStatus, data)`. It validates the response against the route schema at runtime, and it is type-safe on status codes
- **`@throws` in JSDoc**: only for a throw the caller cannot predict, such as a boot failure or a multi-reason rejection. Add none for the standard `ItemNotFound` throw of a missing row - every service does it, so the tag carries no information

## The chain

A request crosses the same layers in every app that mounts this package:

```
Route definition (packages/api-routes/src/)
  -> Router handler (respond + try/catch)
    -> Service (business logic)
      -> Storage (packages/storage/src/)
        -> libSQL (Turso)
```

Wire a backend feature end-to-end along that chain. `/api-patterns` holds what goes in
each layer. Never filter on the client when the request asks for backend filtering.
