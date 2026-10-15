# Configs

Shared tool configuration for the whole monorepo: `oxlint`, `tsconfig`, `vitest`, and the `checklist` runner. Every package extends these files. A change here affects every package at once.

See root `CLAUDE.md` for shared rules (types, patterns, shell, file structure).

## Before you edit a config

1. **Do not edit a config to make one file pass.** If one file needs an exception, use a disable directive in that file: `// oxlint-disable-next-line <rule>`.
2. **Edit a config only when the rule is wrong for the project.** The user decides this. Report the case, propose the change, then apply it when the user agrees.
3. **Never touch `checklist/repo.json` to skip a step.** If a step fails, fix the cause.
4. **Put a rule for one kind of workspace in the shared config of that kind**, for example a React rule in `oxlint/oxlint.config.react.ts`. A workspace config holds only what that workspace alone needs.

## Odd scenarios: report, do not patch

The checklist runs `lint:fix` and then `fmt`. Both tools rewrite code. If the two tools disagree, the checklist passes once and then fails on the next run. A green checklist is not proof of a stable tree.

**If you see one of these signs, stop and report to the user:**

- The checklist passes, but a second run fails on a lint or format step.
- `lint:fix` changes a line, and `fmt` changes it back.
- The only fix you can find is a rewrite of the code shape (bracket access, a constant for a key, a helper function) that has no other reason to exist.

Do not apply a workaround that hides the conflict. Do not loop on autofix. Report the case with the rule name, the file, and the two versions of the line.

## Known cases and how to act

| Case                                                                                                         | Cause                                                                                                                                  | Action                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| An external service returns a field with a `__` prefix (example: `row.__count`). Lint and format loop on it. | `eslint/no-underscore-dangle` (category `style`) rejects `row.__count`. The formatter rewrites `row["__count"]` back to `row.__count`. | Do not read the key through a constant to dodge the rule. Report to the user. The fix is to set `"eslint/no-underscore-dangle": "off"` in `oxlint/oxlint.config.base.ts`, or an `allow` list for the known fields. |
