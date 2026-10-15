---
name: retro
description: Finds why the agent went wrong in a session, and whether a change to the steering files would prevent it.
argument-hint: "[session id | transcript path]"
user-invocable: true
disable-model-invocation: true
---

# Retro

Find each point in a session where the agent went wrong, understand **why** it reasoned that way, and decide whether a change to the environment prevents it next time. The code of the session is out of scope.

Change nothing. Report, ask, then apply only what the user picks.

## Steps

### 1. Read the session

- No argument: the current session.
- A session id or a path: read that transcript. Claude Code keeps transcripts in `~/.claude/projects/<cwd-with-dashes>/<session-id>.jsonl`. Read it with a sub-agent and ask for the moments listed in step 2, with the agent's reasoning before each one. Do not load the whole file in your context.

### 2. Find the moments

A moment is a point where the agent went wrong:

- The user corrected the agent, rejected its change, or repeated an instruction.
- The agent took a wrong path and backed out of it.
- A check or a review failed on a mistake the agent made.
- The agent spent many calls to find a file, a rule or a fact.

### 3. Find the cause

For each moment, reconstruct what the agent believed and where that belief came from. Quote the reasoning or the call that shows it. Then name the cause:

- **Missing**: no file held the fact or the rule.
- **Not loaded**: a file held it, but the agent never read it: no pointer led there, or the agent skipped an `AGENTS.md` on the path.
- **Ambiguous**: a rule allows the wrong reading. Quote the rule and the reading.
- **Wrong or stale**: a rule or a doc says something false, or two files disagree.
- **Habit**: the agent fell back to a general default that this repo does not follow, and no rule names the exception.
- **Slip**: the right rule was loaded and clear, and the agent ignored it.

Do not stop at the first plausible cause. Check it: read the file the agent should have used, and confirm it was or was not in the session.

### 4. Decide if it is fixable

- **Missing**, **Not loaded**, **Ambiguous**, **Wrong or stale**, **Habit**: propose the smallest change that fixes the cause, in the right place:
    - a folder `AGENTS.md`, for a rule or a trap of one folder
    - a skill, for a catalog of patterns that crosses layers, or a command the user runs
    - `.agents/agents/code-reviewer.md` or `/refactor`, when a review should catch it
    - the root `AGENTS.md`, only for a rule of the whole repo or a pointer to another file
- **Slip**: propose nothing, unless the same slip happened more than once. Then the rule is too weak or too buried: treat it as **Ambiguous** or **Not loaded**.

A lint rule or a checklist step is out of scope. When a moment looks mechanical enough for one, say so in the finding and leave the decision to the user.

If a steering file says it is generated, propose the change in its generator.

### 5. Find the waste

A second pass over the whole session, for costs that caused no wrong step:

- **Tool economy**: a call with a large output, or a call the agent repeated, that a script, a flag, a report file or a pointer would replace.
- **Information access**: a fact the agent needed and could not reach: a log, the state of a service, a deploy target. Propose how to reach it, and a pointer to that way.
- **No-op rule**: a rule in a steering file that the session shows adds nothing: a check already enforces it, another file repeats it, or the agent did the opposite elsewhere and nothing broke. A rule the session did not need is not a no-op. Propose to delete it.

Each item goes in the report as a moment, with its kind as the cause.

### 6. Report

Reply in the chat. One table, the most costly moment first: a wrong change that ships is worse than a slow search.

| #   | Moment            | Cause     | Fix goes in          |
| --- | ----------------- | --------- | -------------------- |
| 1   | Short description | Ambiguous | `<folder>/AGENTS.md` |

Under the table, three lines per moment:

- **What happened**: the wrong step, and the correction, in one sentence.
- **Why**: what the agent believed and where it came from, in one sentence.
- **Change**: the proposed change, quoting the new or edited text. "None" for a slip.

No intro paragraph, no recap. Then ask: "Which of these do you want me to apply?" and stop.

### 7. Apply

Apply the changes the user picks. Read every `AGENTS.md` on the path of each file first. Then run `pnpm checklist`.
