import type { Month, WeekDay } from "shared/temporal"

export type UiInterpolations = {
    "Shared.Cancel": undefined
    "Shared.Close": undefined
    "Shared.Confirm": undefined
    "Shared.Unknown": undefined
    "AlertConfirmationDialog.EnterText": undefined
    "AlertConfirmationDialog.ToConfirm": undefined
    "Toast.Common.FormValidationError": undefined
    "Toast.Error.Api.StatusMessage": { status: string }
    "Toast.Error.Api.Title": undefined
    "Toast.Error.Api.UnknownDescription": undefined
    "Toast.Error.Api.Validation.Title": undefined
    "Toast.Error.Api.Validation.Description": undefined
    "Toast.Error.Generic.Title": undefined
    "Toast.Success.Title": undefined
    "Toast.Warning.Title": undefined
    "Toast.Copy": undefined
    "Toast.Copied": undefined
    "FallbackBox.EmptyTitle": undefined
    "Field.MoreInfo": undefined
    "SelectionIndicator.Selected": undefined
    "SelectionIndicator.NotSelected": undefined
    "SelectionIndicator.Indeterminate": undefined
    "NumberInput.FormatError": undefined
    "NumberInput.Increment": undefined
    "NumberInput.Decrement": undefined
    "PasswordInput.Show": undefined
    "PasswordInput.Hide": undefined
    "OtpInput.Slot": { position: number }
    "DateInput.Placeholder": undefined
    "DateInput.Reset": undefined
    "Combobox.Placeholder": undefined
    "Combobox.Search.Placeholder": undefined
    "Combobox.Search.Prompt.NoMinimumLength": undefined
    "Combobox.Search.Prompt.MinimumLength": { minLength: number }
    "Combobox.Loading": undefined
    "Combobox.Empty": undefined
    "Combobox.Chips.NMoreSingular": { count: number }
    "Combobox.Chips.NMorePlural": { count: number }
    "Combobox.Chips.Remove": undefined
    "Combobox.Reset": undefined
    "Pagination.GoToPage": { page: number }
    "Pagination.Label": undefined
    "Pagination.NextPage": undefined
    "Pagination.PreviousPage": undefined
    "Stepper.GoToStep": { number: number; label: string; status: string }
    "Stepper.Step": { number: number; label: string; status: string }
    "Stepper.Status.Completed": undefined
    "Stepper.Status.NotStarted": undefined
    "Stepper.Status.Partial": undefined
    "Stepper.Steps": undefined
    "DayPicker.PreviousMonth": undefined
    "DayPicker.NextMonth": undefined
    "DayPicker.PreviousYear": undefined
    "DayPicker.NextYear": undefined
    "DayPicker.PreviousYears": undefined
    "DayPicker.NextYears": undefined
} & { [K in `Days.${"Full" | "Short"}.${WeekDay}`]: undefined } & {
    [K in `Months.${"Full" | "Short"}.${Month}`]: undefined
}

export type UiTranslationKey = keyof UiInterpolations

export type UiTranslate = <K extends UiTranslationKey>(
    key: K,
    params: UiInterpolations[K],
) => string
