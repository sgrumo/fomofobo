---
name: dialogs
description: "Dialog patterns for the frontend: a wrapped form, a confirmation dialog, pending state. Use when you build or edit a dialog."
user-invocable: false
---

# Dialog Patterns

- **Location**: the shared components directory of the app, `<name>-dialog/<name>-dialog.tsx`. The `AGENTS.md` of the app names that directory. Name it `<verb>-<entity>-dialog`, for example `create-todo-dialog`, `update-todo-dialog`.
- **Primitives**: `ui-components/dialog` (`DialogRoot`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`).
- Sections marked _(form)_ apply only to dialogs that wrap a form. Display and confirmation dialogs ignore them.

## Sizing & scroll

- **ALWAYS cap height** on `DialogContent`: `className="max-h-[calc(min(<rem>,90dvh))] w-[calc(min(<rem>,90dvw))]"`. The base popup sets **no** height on purpose. Each dialog owns its cap.
- The `90dvh` is the viewport safety net (never taller than the screen). The `<rem>` is a **content-driven** ceiling. **Tune it per dialog**, do not reuse one value. Short forms stay small (~26-34rem). Field-heavy or list/table dialogs go larger (40rem+). Set the rem at the natural full height of the content, so it scrolls only when the viewport forces it.
- Put scrollable content in `<DialogBody>` (scroll is built in): header and footer stay fixed, only the body scrolls once content exceeds the cap. Without the `max-h` cap, `DialogBody` has nothing to scroll against and tall content overflows the viewport.

## Forms live outside the dialog _(form)_

- A dialog **NEVER** owns fields or a `.state.ts`. The form is its own component in the shared components directory: `<name>-form/<name>-form.tsx` + `<name>-form.state.ts` (state, reducer, `initial<Name>FormState`, `<name>FormStateToX` conversion). See the `forms` skill.
- The form is presentational: `{ value, onValueChange }` (+ read-only context props such as `intent`). It renders `Field` + inputs. No mutation, no submit, no dialog awareness. It stays reusable outside dialogs.
- The dialog **wraps** that form and adds the shell: holds the form state, runs the conversion, owns the mutation, and wires the submit and cancel buttons.

## Trigger

- If a click can open it, pass a `trigger: ReactElement` prop and render `<DialogTrigger render={props.trigger} />`. The trigger is a `Button`.
- Works together with controlled `open`/`onOpenChange`.

## Content separation _(form)_

- **Exported component**: renders `DialogRoot` > `DialogTrigger` + `DialogContent`. Owns `open` (and `pending`).
- **Private content component** (same file, not exported): rendered inside `DialogContent`. Holds the form state (`useState(initial<Name>FormState)`) + the mutation.
- Why: `DialogContent` unmounts its children on close, so the content component state resets on its own. No manual cleanup.
- Skip it when the dialog holds no state (form state comes from props).
- **NEVER** extract title, body, or footer into their own components. Inline them.

## Exported component _(form)_

- Props: `trigger` (+ the entity for an update dialog). **DO NOT** pass i18n labels. The content component calls `useTranslation` itself.
- Track `open` + a `pending` boolean. In `onOpenChange`, if closing while `pending`: `toast.addPlain("warning", t("<Entity>.Toast.CloseWhileUpdating"))` (or `CloseWhileCreating`) and `return`. The message is an entity-specific i18n key, never a shared preset.
- Owns the `pending` state. Pass the content plain lifecycle callbacks it forwards to its mutation: `onMutate` (set pending true), `onSettled` (set pending false), `onSuccess` (close the dialog). The content never sets pending itself. It exposes these hooks only.

## Private content component _(form)_

- `useId()` for `formId`; `useState(initial<Name>FormState)`; render the form: `<XForm value={form} onValueChange={setForm} />` inside `Form` (from `ui-components/form`, `id={formId}`).
- Mutation via `useMutation(api.<namespace>.<operation>Mutation)`. Forward the parent callbacks on the `mutate(...)` call: `onSettled: props.onSettled`, `onSuccess` (success toast + `props.onSuccess()`). Call `props.onMutate()` right before `mutate`. Use the mutation `isPending` for the buttons `loading`/`disabled`.
- Submit handler: run the form `<name>FormStateToX` conversion. Toast on failure and `return`. Otherwise `mutate(value)`.

## Footer buttons _(form)_

- `<DialogFooter className="grid grid-cols-2 gap-2">` (full-width buttons).
- Cancel: `<DialogClose render={<Button variant="secondary" size="md" type="button" disabled={isPending}>…</Button>} />`.
- Submit: `<Button variant="primary" size="md" type="submit" form={formId} loading={isPending}>…</Button>`. `loading` shows the spinner. Never replace the label with it.

## Confirmation dialogs

- Destructive or confirm actions: use `ui-components/alert-dialog`. **Never** hand-roll with `Dialog` primitives.
