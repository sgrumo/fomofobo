---
name: arch-review
description: Scans the codebase for deepening opportunities and hygiene problems, and presents them as tables in the chat. Use only when the user asks for an architecture review.
disable-model-invocation: true
---

# Architecture Review

Find architectural friction and propose **deepening opportunities**: refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

Also flag two **hygiene** problems that no lint rule or diff review catches: one job done two ways, and swallowed errors.

Change no code. Produce one report in the chat, then stop. The only files you write are `.ignored/architecture-review.md` and, when the user agrees, a line in `rejected-deepenings.md` (step 4).

## Vocabulary

Use these terms exactly. Do not substitute "component", "service", "API", or "boundary".

- **Module**: anything with an interface and an implementation. A function, a class, a package, or a slice across tiers. _Avoid_: unit, component, service.
- **Interface**: everything a caller must know to use the module correctly. The type signature, and also invariants, ordering constraints, error modes, required configuration, and performance characteristics. _Avoid_: API, signature.
- **Implementation**: the body of code inside a module.
- **Depth**: leverage at the interface. A module is **deep** when a large amount of behaviour sits behind a small interface. It is **shallow** when the interface is nearly as complex as the implementation.
- **Seam**: a place where you can alter behaviour without an edit in that place. The location of a module's interface. _Avoid_: boundary.
- **Adapter**: a concrete thing that satisfies an interface at a seam. It names a role, not the contents.
- **Leverage**: what callers get from depth. One implementation pays back across N call sites and M tests.
- **Locality**: what maintainers get from depth. Change, bugs, knowledge, and verification concentrate in one place.

## Principles

- **The deletion test.** Imagine you delete the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it earns its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. If a test must reach past the interface, the module has the wrong shape.
- **One adapter means a hypothetical seam. Two adapters mean a real one.** Do not propose a seam unless something varies across it.
- **Depth is a property of the interface.** A deep module can hold small internal parts and internal seams. They are not part of its interface.
- **Replace, do not layer.** Tests at the deepened interface replace the old unit tests on the shallow modules.

## Dependency categories

Classify the dependencies of each candidate. The category sets how the deepened module is tested across its seam.

1. **In-process**: pure computation, in-memory state, no I/O. Merge the modules and test through the new interface.
2. **Local-substitutable**: a dependency with a local stand-in. Here those are the database, the object store, the OIDC provider, and the filesystem. The E2E suites run the database on a local libSQL file, and the object store and the OIDC provider in containers. The filesystem stand-in is a temporary directory. The seam stays internal.
3. **Ports & adapters**: our own remote process, for example the API app called by a frontend app. Define a port at the seam, with a production adapter and an in-memory adapter.
4. **Mock**: a third-party service we do not control, for example a CMS or a cloud provider API. Inject it as a port. Tests use a mock adapter.

## Process

### 1. Scope

Deepening pays off when the module changes again. Decide where to look before you scan.

- If the user names a direction (a module, an app, a pain point), take it.
- If not, read a long stretch of `git log --oneline --name-only`. Find the hot spots: the paths that keep coming up. Put the ones with no tests first. Start there. If the changes are scattered, widen the net.

Read the `AGENTS.md` files in the area. They hold invariants and traps that a candidate must respect.

Read `rejected-deepenings.md` in the folder of this skill if it exists. It lists the deepenings the team rejected.

Read `.ignored/architecture-review.md` if it exists. It holds the table of the last review.

### 2. Explore

Spawn one or more `Explore` sub-agents to walk the scoped area. Do not follow rigid heuristics. Note where you feel friction:

- Where does one concept require a jump across many small modules?
- Where is a module shallow, with an interface nearly as complex as its implementation?
- Where did someone extract a pure function only for testability, while the bugs hide in how callers use it (no locality)?
- Where do two flows hold copied code with small differences?
- Where do coupled modules leak across their seams?
- Which parts are untested, or hard to test through their current interface?

Apply the deletion test to each suspect. Keep only the "complexity concentrates" cases.

Ask the sub-agents for hygiene problems too, across apps and packages, not only in the scoped area:

- **One job, two ways**: two implementations of one concern, for example two HTTP clients, two env helpers, or two formatters for one value. Name the module that should own it, often a shared package that exists already.
- **Swallowed error**: a `catch` on I/O that drops the error with no log and no rethrow, for example `.catch(() => undefined)`. Skip it when a comment or a `@remarks` says why.

Drop a candidate listed in `rejected-deepenings.md`, unless the friction grew since the reason was written. Then keep it, with status `Reopened`, and say what changed.

### 3. Report

Reply in the chat.

Open with one table, strongest candidate first:

| #   | Candidate                   | Strength | Status | Dependency category   | Files                    |
| --- | --------------------------- | -------- | ------ | --------------------- | ------------------------ |
| 1   | Short name of the deepening | `Strong` | `New`  | `local-substitutable` | `path/a.ts`, `path/b.ts` |

- **Strength** is `Strong`, `Worth exploring`, or `Speculative`.
- **Status** is `New`, `Open` (in the last review and still there), or `Reopened` (rejected before, see step 2).
- **Files** lists the main modules. Use `path:line` when one line carries the point.

Under the table, give each candidate a block of three lines:

- **Problem**: one sentence. What hurts.
- **Solution**: one sentence. What changes.
- **Wins**: a few short phrases in vocabulary terms, for example "locality: one query to fix". Never "cleaner code" or "easier to maintain".

Then a short section, **Resolved since the last review**: the candidates of the last table that are gone, one line each. Omit the section when there is no last review.

Then the hygiene table, at most five rows, most harmful first. Omit it when there are none:

| #   | Problem                | Kind       | Files                    | Fix                         |
| --- | ---------------------- | ---------- | ------------------------ | --------------------------- |
| H1  | Short name of the case | `two-ways` | `path/a.ts`, `path/b.ts` | One sentence: what changes. |

- **Kind** is `two-ways` or `swallowed-error`.

End with one line: **Top recommendation**: the candidate to tackle first, and why.

No diagrams, no intro paragraph, no recap. Use the vocabulary above exactly.

Overwrite `.ignored/architecture-review.md` with the date, the output of `git rev-parse --short HEAD`, and both tables.

Do not propose interfaces yet. After the report, ask: "Which of these do you want to explore?" Then stop. Do not interview the user about a candidate they did not pick.

### 4. Record a rejection

If the user rejects a candidate for a reason that a future review needs, offer to record it: "Do you want me to add this to `rejected-deepenings.md` so the next review skips it?"

- Offer only for a lasting reason: a constraint, a trade-off the team chose. Not for "not now" or "not worth it yet".
- On a yes, add one line to `rejected-deepenings.md` in the folder of this skill: the candidate name, its main path, and the reason in one sentence. Create the file if it does not exist.
