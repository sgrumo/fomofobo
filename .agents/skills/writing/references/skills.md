# Skills

Read this file when the text is a skill. The rest of the writing rules are in `../SKILL.md`.

## Invocation

A skill is model-invoked or user-invoked. The choice trades context against memory.

| Kind          | Frontmatter                                                          | The agent can fire it                 | Cost                                                        |
| ------------- | -------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------- |
| Model-invoked | A `description` that lists the trigger branches                      | Yes. Another skill can also call it.  | The `description` loads in every session.                   |
| User-invoked  | `disable-model-invocation: true` and a one-line, human `description` | No. Only a person who types the name. | No context. The person must remember that the skill exists. |

Choose model-invoked only when the agent must reach the skill alone, or another skill must call it. Otherwise choose user-invoked.

A model-invoked skill with only reference is a shared home: several skills call it, so the reference lives in one place. Two user-invoked skills cannot call each other. Their shared reference goes into a plain file that both point to.

## Split by invocation

Split off a new model-invoked skill only when it has its own trigger word, one that people use in their prompts, or when another skill must call it. Its `description` loads in every session, so the separate reach must be worth that cost.
