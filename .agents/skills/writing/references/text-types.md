# Text types

Read this file when the text is one of the types below. Each type adds a pattern to the sentence rules of `../SKILL.md`.

## Error message and CLI output

State what happened (simple past), the cause if known, and the command or condition that fixes it.

> Before: Oops! Something went wrong while attempting to establish a connection. Please ensure your credentials are properly configured and try again.
> After: Connection to the database failed. The password for user `app` was not correct. Set `DB_PASSWORD` and connect again.

## Runbook

Every step is one imperative instruction, condition first, 20 words at most with no exception. A warning comes before its step.

## Incident report

Simple past only, with times. State what is known and write "unknown" for the rest. No hedge such as "may have impacted".

> Before: We have identified an issue that may have impacted some users' ability to access the service.
> After: Between 14:02 and 14:31 UTC, 12% of requests failed. A deploy at 14:00 removed the cache warmup step.

## PR body and release notes

One change for each line or entry. A breaking change is a warning: the command first, then the change. "Update your calls to `v2/users`. The `name` field split into `first_name` and `last_name`." Delete "this PR aims to".

## UI copy

Buttons and labels are names, and they keep their form. Body copy follows the sentence rules: "No projects yet. Create a project to start."
