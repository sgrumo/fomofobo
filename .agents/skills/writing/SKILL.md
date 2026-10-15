---
name: writing
description: How to write a text that a person or an agent reads later, at the level of the document and of the sentence. Use before you write or rewrite a doc, a README, a plan, a PR body, a skill, an AGENTS.md or CLAUDE.md, an error message, or a long code comment. Another skill or the user owns what the text says.
---

# Writing

This skill owns how a text is written. Another skill or the user owns what it says. Sources and licenses are in `LICENSE`.

The goal: a reader outside your field understands the text on one read, and an agent takes the same path through it on every run.

## Before you write

Name three things. If you cannot, ask the user.

1. The reader: a person, an agent, or both.
2. The trigger: the text is always loaded, reached by a pointer, or found by a search.
3. The action: the reader acts, decides, or looks up a fact.

## The document

### Steps and reference

A document holds steps (actions in order) and reference (rules and facts, read on demand). Place each piece on this ladder:

1. In-file step: what the reader does, in order.
2. In-file reference: what every branch of the document needs.
3. Disclosed reference: a separate file behind a pointer, for what only some branches need.

A branch is one distinct case that the document handles. Keep the definition, the rules, and the caveats of one concept under one heading. A file that is too long thins the attention of the reader, even when each line is true. Move reference down the ladder until the top is short.

### Pointers

A pointer names material outside the text and the condition to read it: "If the document is a skill, read `references/skills.md`." The wording of the pointer decides when the reader reaches the material.

- Put the key word first.
- Write one trigger for each branch. Synonyms of one branch are one trigger.
- If a required file is missed, make the pointer sharper first. Copy the material into the main file only if that fails.

An always-loaded text (`CLAUDE.md`, `AGENTS.md`, a skill `description`) costs context on every turn. It holds only rules for the whole repo and pointers.

### Completion

Each procedure is a numbered list, one action per step. Each step or procedure ends on a completion criterion: a condition that the reader can check. "Every changed model has a row" is a criterion. "Understand the code" is not, and it invites an early stop.

Make the criterion demanding when the work must be thorough: "every rule applied", "every caller listed".

### Split

Split a document only when the cut pays for itself:

- By sequence: when later steps tempt the reader to rush the current step. This works only across a real boundary, such as a hand-off to a subagent.
- By trigger: when one part has its own trigger word, or another skill must reach it.

### Words that carry behavior

Use a word that the model already knows for a whole idea: "tight loop" in place of "fast, deterministic, low overhead". Repeat the same word at each site. Define a new word only when no existing word fits.

Write the target behavior: "Write one-line comments." A ban puts the banned behavior in the mind of the reader. Write a ban only for a hard guardrail, and put the target behavior next to it.

### Prune

- One meaning, one home. Write a fact only in the place that owns it. Anywhere else, point to that place at most, and never restate the fact.
- The environment is a home too: the code, `package.json`, config files, the folder layout, `--help`. Leave out a fact that the code or one command shows. Write what nobody can find by looking: the unwritten convention, the reason for a choice, the trap.
- Delete a sentence that does not change what the reader does. Delete the whole sentence, not some words.
- Before you write a fact, name what changes it. If a routine change elsewhere makes it false, leave it out or point to its home. Counts, versions, file lists, paths, default values, and owners are such facts. Write what stays true until the design changes.
- Delete a stale line when you see it. Old layers settle because to add feels safe and to remove feels risky.
- Write the text as the system is now, ordered by the domain, never by the calendar. A history log is the only exception, and its skill says so.

## The sentence

ASD-STE100 Simplified Technical English, plain mode:

1. A step is imperative, one instruction, 20 words at most. An explanation uses simple tenses, 25 words at most, six sentences in a paragraph at most.
2. Put the condition first, with a comma: "If the build fails, read the log."
3. Use the active voice and name the actor. No present perfect. No "-ing" verb after a comma.
4. Use only the modals can, will, and must. A model reads "should" as optional. A required "should" becomes "must". An optional one goes away.
5. Use complete grammar: no contractions, keep the articles and "that". No semicolons and no em-dashes.
6. Use one word for one meaning in the whole text. Write "make sure that" for check, verify, confirm, and ensure. Break a noun chain of more than three words with a preposition.
7. Name what the step needs before the action: the host, the flag, the prior step. Define a new term at its first use, in ten words at most. Do not define a product name.
8. State the fact, not its importance. If a word carries no fact, delete it. Write "X does Y", not "not just X, it is Y". Write a list of three only when three items exist. Write "for example", "that is", and the full list, not "e.g.", "i.e.", or "etc.".
9. Format for the eye: no bold lead-ins, no bold for emphasis, no emoji. A vertical list holds three or more parallel items.
10. Write a warning as the command or the condition, then the risk.
11. Never change code, identifiers, commands, paths, quoted errors, product names, or facts. Use American spelling.

## References

- If the text is a skill, read `references/skills.md`.
- If the text is an error message, a runbook, an incident report, release notes, a PR body, or UI copy, read `references/text-types.md`.

## Done when

- [ ] You can name the reader, the trigger, and the action.
- [ ] Each fact has one home, and the text points to the others.
- [ ] Each procedure ends on a criterion that the reader can check.
- [ ] Each of your three longest sentences is under the limit of sentence rule 1.
- [ ] Outside code, a search finds none of `'`, `has been`, `should`, `may`, `might`, `;`, `—`, `, making`, `**`.
- [ ] Each hit of `check`, `verify`, `validate`, `config`, or `settings` is the one word that the text uses for that meaning.
