# Infra

See root `CLAUDE.md` for shared rules (types, patterns, shell, file structure).

## Secrets and configuration

These rules apply to every value that a deploy target, a workflow or a deployed app reads. The document of each target explains its own mechanics. It does not change these rules.

### Credential or configuration

A value is a credential when its holder can authenticate, sign or spend with it. Examples are a key, a token, a password, a webhook URL and a keystore. Every other value is configuration. Examples are an id, an ARN, a URL, a host, a name, a region and a bucket.

- A file takes the kind of its content. A keystore is a credential. A Firebase client config carries an API key, so it is a credential.
- One half of a credential pair stays a credential. `AWS_ACCESS_KEY_ID` is an example.
- If you can derive a value from another value, do not store it. Derive it at the point of use. Stack outputs are an example.

Configuration is not a secret, because GitHub masks a secret in every log. A masked id makes a wrong value hard to find.

### Where each value lives

| Kind                         | Reader         | Store                                                                  |
| ---------------------------- | -------------- | ---------------------------------------------------------------------- |
| Configuration of the runtime | a deployed app | A committed file, one per target. See "Runtime env" below              |
| Credential of the runtime    | a deployed app | The store that the runtime reads. The document of each target names it |
| Configuration of CI          | a workflow     | A GitHub variable                                                      |
| Credential of CI             | a workflow     | A GitHub secret                                                        |

One store stays outside the repository: the secrets of each GitHub environment. It holds the runtime credentials, and the deploy writes them into the Vercel project. `infra/vercel/README.md` lists their keys.

### Add a value

1. Classify the value with the test above.
2. Put it in the store that the table names.
3. Document it where it is read:
    - A workflow secret: declare it under `on.workflow_call.secrets` of the called workflow, with a `description`. A deploy job passes `secrets: inherit`. Every other caller passes the secret by name.
    - A deploy value that differs between environments: put it in each GitHub environment, under the same name.
    - A workflow variable: read it as `vars.X` in the workflow. Add no list of variables anywhere. Add an inline comment only for a fact the code does not show.
    - A runtime value: the committed file of that target. See "Runtime env" below.
4. If the kind is not obvious, write the reason in that description.

## Runtime env

The runtime configuration of the app is committed in `infra/vercel/env/<env>.env`, one file per deploy environment. The deploy writes it into the Vercel project of the environment.

- The files hold no credential.
- A variable that a file never held is unset in that environment. The deploy writes values and never deletes one, so a line removed from a file keeps its last value in the project.
- `infra/vercel/AGENTS.md` holds the rules for a new variable.
