# Authentication (OpenID Connect)

The fullstack app signs every visitor in. It speaks the OpenID Connect Authorization Code
flow with PKCE, so Cognito, Auth0, Entra ID, Keycloak and Zitadel all fit behind
the four `OIDC_*` variables of its `.env.template`. The app discovers every endpoint
from the issuer.

Register two URLs at the provider, for each environment:

- Redirect URI: `$APP_BASE_URL/auth/callback`
- Sign-out URL: `$APP_BASE_URL/`

`APP_BASE_URL` is the origin the browser reads the app on. Each deploy
environment sets it in its block of `apps/fullstack-fomofobo/wrangler.jsonc`.

The provider must answer over HTTPS in `cloudflare`. Plain HTTP is
accepted in `local` and `test` alone, where the provider is a container on
`localhost`. The app refuses to boot otherwise.

Behind a proxy the app writes its session cookies with the `__Host-` prefix and
the `Secure` flag. A browser keeps such a cookie only when the page arrived over
HTTPS on the exact host the cookie names. So the proxy must terminate TLS and
forward the `Host` header unchanged, as Cloudflare does in front of a Worker. A
proxy that rewrites the host, or that speaks plain HTTP to the browser, leaves
every visitor signed out with no error to read.

CAUTION: The app refuses a token minted for another audience. A provider that
mints the access token for the client instead of the API needs `OIDC_AUDIENCE`
set to the client id, which is what the E2E suites do.
