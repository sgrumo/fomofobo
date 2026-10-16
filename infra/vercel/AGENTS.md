# Vercel deploy target

`README.md` holds the setup of an environment and the deploy steps.

- A new configuration value that the app reads goes into every `env/<env>.env`.
- A new credential goes into every GitHub environment as a secret, into `on.workflow_call.secrets` and the `env` of `deploy-vercel.yaml`, into `SECRET_NAMES` of the step that writes the runtime values, and into the table of `README.md`.
- Each deploy applies its migrations before the new code serves, and the running code serves until the deploy ends. A migration that the running code cannot read needs two deploys: first the code that reads both shapes, then the migration.
- A new environment needs its branch in `resolve-env` of `ci.yaml`, an `env/<env>.env`, a GitHub environment, a Vercel project, a Turso database and R2 buckets.
- The region of `vercel.json` sits next to the Turso location. Move both, or neither.
