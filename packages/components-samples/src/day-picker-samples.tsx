import { useState } from "react"
import { DayPicker } from "ui-components/day-picker"
import { Field } from "ui-components/field"

/**
 * @description Maps a date to a `yyyy-MM-dd` string
 * @param value Date formatted
 * @remarks Reads local date parts, avoiding the UTC day shift of `toISOString`
 */
const toIsoDay = (value: Date) =>
    [
        String(value.getFullYear()),
        String(value.getMonth() + 1).padStart(2, "0"),
        String(value.getDate()).padStart(2, "0"),
    ].join("-")

export const DayPickerSamples = () => {
    const [value, setValue] = useState<Date | undefined>(undefined)

    return (
        <div className="flex flex-col items-start gap-4">
            <Field label="Sample Day Picker" required={false}>
                <DayPicker value={value} onValueChange={setValue} />
            </Field>
            <p>Picked day: {value ? toIsoDay(value) : "none"}</p>
        </div>
    )
}
