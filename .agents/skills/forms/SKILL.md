---
name: forms
description: "Form patterns for the frontend: the `.state.ts` reducer, safe schema conversions, translated errors per field. Use when you build or edit a form."
user-invocable: false
---

# Form Patterns

- **Location**: the shared components directory of the app, `<name>-form/<name>-form.tsx` + `<name>-form.state.ts`. The `AGENTS.md` of the app names that directory. A form is a shared component even when one page uses it. A form is a reusable unit.
- A form is **presentational**: props `{ value, onValueChange, errors }` (+ read-only context such as `intent`, `user`, or `disabled`). No mutation, no submit, no dialog or page awareness. The **consumer** (page, card, dialog) owns state, conversion, mutation, and buttons.

## `<name>-form.state.ts`

Ordered `//#region` sections. Each state file holds every section that applies:

- **Types**: `interface <Name>FormState` with every field as `T | undefined` (a fresh form starts empty). `type <Name>FormAction` = discriminated union `{ type: "field-name"; value: T | undefined }`. The action `type` literal is **always kebab-case**. The matching state key stays camelCase.
- **Initial State**: `initial<Name>FormState()` returns an all-`undefined` state. Add a `<name>FormStateFrom<Entity>(entity)` variant when the form edits an existing entity.
- **Actions**: one `xxxAction = (state) => (action: Action<<Name>FormAction, "field-name">) => ({ ...state, fieldName: action.value })` per field. The `Action` selector uses the kebab-case action `type`. The helper name and the spread key stay camelCase. `Action` comes from `"frontend-shared/types"`.
- **Reducer**: `<name>FormReducer(state, action)` = `match(action).with({ type: "…" }, …Action(state)).…exhaustive()`.
- **Conversions**: `<name>FormStateToX(state, i18n)` validates and maps to the request type. See below.
- **Helpers** (optional): unsaved checks, submittable checks.

## Conversions - the `satisfies` guard

The conversion maps the form state to the **destination type** (a `models` type: `XCreation`, `XUpdate`, …). The mapped literal **MUST** `satisfies` the deep fully-specified partial of that type. A model change then fails to compile here, instead of a runtime validation error for the user:

```ts
export const xFormStateToCreation = (
    state: XFormState,
    i18n: I18nInstance,
): FormResult<XFormState, XCreation> => {
    const parsed = parseFormState(
        xCreationSchema,
        {
            field: state.field,
        } satisfies Specified<Partial<XCreation>>,
        i18n,
    )
    return parsed.success
        ? ok(parsed.data)
        : err(z.treeifyError(parsed.error).properties ?? {})
}
```

- `Specified` + `Partial` from `"shared/types"` wrap the **destination type** (`XCreation` from `"models"`). Both recurse by default. The result is the deep-required-but-optional-valued shape: every key present, each value `T | undefined`. Pass `{ mode: "shallow" }` to stop at the first level, or `{ exclude: "path" | "other.[N].path" }` to keep a path as declared. A new model field -> the literal lacks a key -> compile error. A renamed or retyped field -> mismatch -> compile error.
- Annotate the literal inline with `satisfies`. Do **not** hoist a typed `const` first.
- The destination type is the source of truth. Never annotate against a hand-written shape.
- `parseFormState` from `"@/lib/forms/forms"`, never `schema.safeParse`. It runs the schema with the error map of `i18n` (`import type { i18n as I18nInstance } from "i18next"`), so each issue message is already translated. Never import the `i18next` default: a server-rendered app holds one instance per request.
- Return type **always** `FormResult<State, Output>` (`"frontend-shared/types"`): `ok(output)` or `err(FormErrors<State>)`. `ok`/`err` from `"shared/result"`. `z` is a value import (`z.treeifyError`). The `.properties` tree is keyed by the **schema** keys. Return it as is only when state keys equal schema keys. Otherwise build the tree by hand (next section).
- Checks beyond the schema (cross-field, password policy) return the same tree: `err({ confirm: { errors: [message] } })`. `message` is translated with `i18n`.
- Dates: the state holds a `Date | undefined`. The conversion maps it with `isoDate` from `"shared/temporal"`. The `From<Entity>` builder parses it back with `dateFromIso`.
- Nullable update fields: map `state.field ?? null`, so an emptied field clears the column.

## Conversions - the hand-built error tree

Rule: every error the destination schema can raise resolves to one rendered target, or to the consumer's fallback toast. Not every state key needs an error. A key that never fails (a boolean, an intent flag) maps to `undefined`.

```ts
const tree = parsed.success ? undefined : (z.treeifyError(parsed.error).properties ?? {})
const attachmentErrors = attachmentFileErrors(state.attachment, i18n)
const errors = {
    ratio: tree?.metrics?.properties?.ratio,
    attachment: attachmentErrors.length > 0 ? { errors: attachmentErrors } : undefined,
    removeAttachment: undefined,
} satisfies Specified<FormErrors<XFormState>, { mode: "shallow" }>
return parsed.success && attachmentErrors.length === 0 ? ok(parsed.data) : err(errors)
```

- The literal `satisfies Specified<FormErrors<State>, { mode: "shallow" }>`: every state key present, each value a tree or `undefined`. A new state key -> compile error. The nested read is typed on the schema output, so a renamed schema field -> compile error.
- **Nested or renamed path**: if the schema nests or renames a field that the state keeps flat (`metrics.ratio` vs `ratio`), assign the nested node to the state key: `ratio: tree?.metrics?.properties?.ratio`.
- **Never spread `tree`** when no key aligns. TypeScript skips excess property checks on a spread, so schema keys leak into the errors and no `Field` reads them. Spread first and override the remapped keys only when most keys align.
- **Value outside the schema** (a `File` sent in another request): a hand-built `{ errors: [message] }` under its state key. Translate `message` with `i18n.getFixedT(null, "<ns>")`. It bypasses the error map. Success = parse success **and** no hand-built error. Never `ok(parsed.data)` with an error attached.
- **Hidden branch**: a `Field` hidden by another state key (a union kind) cannot show its error. Route the remap along the visible branch: `ownerId: state.kind === "owner" ? tree?.target : undefined`.
- **Pick-time checks** (file size, content type) live in the conversion, not in the form component.

## Error messages

- Issue -> `ui` namespace key, by Zod issue code: `FormErrors.Required`, `FormErrors.TooSmall.string.Inclusive`, `FormErrors.InvalidFormat.email`, … Resolution lives in `frontend-shared/forms`. Do **not** pass `message`/`error` to schema builders for form wording.
- Custom errors: a `refine` in `models` sets `params: customErrorParamsSchema.encode({ errorCode, message })`, never `error` (see `packages/models/AGENTS.md`). The map yields `FormErrors.Custom.<errorCode>`.

## Form component

- Props: `{ value, onValueChange, errors: FormErrors<XFormState> | undefined }` (+ context). `FormErrors` from `"frontend-shared/types"`.
- `useTranslation` for labels (never hardcode). Build `onAction` = `(action) => props.onValueChange(<name>FormReducer(props.value, action))`.
- Wrap each input in `Field` (`ui-components/field`) with `label` + `required` + `errors={props.errors?.field?.errors}`. Inputs come from `ui-components/*` (`StringInput`, `Textarea`, `DateInput`, `Checkbox`, …) driven by `value`/`onValueChange`.
- Checkbox: `Field` with `labelSide="right"`.
- A bare input with no visible label still sits in a `Field`, with `srOnly={true}`. No `Field`, no place for the error.
- Forward `disabled` to inputs when the form takes it. Return a `<>`-fragment of fields, never its own `<form>`.
- One form for create and update: the state file exports both `…ToCreation` and `…ToUpdate`. Hide update-only fields with an `intent: "create" | "update"` prop.

## Consumer wiring

- `const { t, i18n } = useTranslation("<ns>")` (`"react-i18next"`). No `useLanguage()` for the form.
- `const { formId, form, setForm, errors, convert } = useForm(initial<Name>FormState, <name>FormStateToX, i18n)` (`"react-shared"`). Pass `() => <name>FormStateFrom<Entity>(entity)` as initial value for an update form. No `useId`, no `useState` for the form.
- `useForm` reruns the conversion on every render, so `errors` is live. `Field` shows them only after the first submit and hides them while the user edits that field.
- Render inside `Form` (`ui-components/form`, `mode="edit"`, `id={formId}`, `noValidate={true}`) with `onSubmit={handleSubmit}`; `<XForm value={form} onValueChange={setForm} errors={errors} />`. `noValidate` is mandatory: browser validation must not preempt the field errors.
- `handleSubmit`: `const result = convert(form)`. On failure `toast.add("form-validation-error")` and `return`. Otherwise `mutate(result.value)`.
- Submit `Button type="submit" form={formId}` with `loading={isPending}` from the mutation. For dialogs, see the `dialogs` skill.
