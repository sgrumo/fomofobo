import { z } from "@hono/zod-openapi"

/**
 * Issuer of the provider, as it appears in the `iss` claim.
 *
 * It is a full URL and it can carry a path, which every discovery call keeps: a
 * mock provider serves one issuer per path segment, and so do several tenants of
 * a real one.
 */
export const oidcIssuerSchema = z
    .string()
    .nonempty()
    .pipe(
        z.url({
            error: "must be the issuer URL of the provider, for example https://auth.example.com",
        }),
    )

/**
 * Audience the API accepts, as it appears in the `aud` claim.
 *
 * A token minted for another audience is a token for another API, so the check is
 * what keeps one provider from opening every service it signs for.
 */
export const oidcAudienceSchema = z.string().nonempty()

/**
 * Key set of the provider, for a deployment that reaches the keys but not the
 * metadata.
 *
 * Empty by default, where discovery resolves the URL on its own. Set it when the
 * discovery document sits behind a gateway the API cannot call.
 */
export const oidcJwksUrlSchema = z
    .string()
    .nonempty()
    .pipe(
        z.url({
            error: "must be the key set URL of the provider, for example https://auth.example.com/.well-known/jwks.json",
        }),
    )
