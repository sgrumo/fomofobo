import { addDays, endOfYear, startOfYear, subDays } from "date-fns"
import { useState } from "react"
import { DayPicker } from "ui-components/day-picker"
import { Field } from "ui-components/field"

export const DayPickerShowcase = () => {
    const [date, setDate] = useState<Date>(() => new Date())
    const [dateWithMin, setDateWithMin] = useState<Date>(() => new Date())
    const [dateWithMax, setDateWithMax] = useState<Date>(() => new Date())
    const [dateWithMinMax, setDateWithMinMax] = useState<Date>(() => new Date())
    const [disabledDate, setDisabledDate] = useState<Date>(() => new Date())
    const [fieldDate, setFieldDate] = useState<Date>(() => new Date())
    const [describedDate, setDescribedDate] = useState<Date>(() => new Date())

    // TODO: move the `new Date()` call out of render, then remove this directive
    // oxlint-disable-next-line react/purity
    const today = new Date()
    const minDate = addDays(startOfYear(today), 7)
    const maxDate = subDays(endOfYear(today), 7)
    return (
        <div className="grid h-full w-full grow grid-cols-1 items-start justify-items-center gap-8 p-4 lg:grid-cols-2 lg:p-8">
            <div className="flex flex-col gap-4">
                <h3 className="tp-b2-semibold">Default</h3>
                <DayPicker value={date} onValueChange={setDate} />
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="tp-b2-semibold">With Min Date</h3>
                <DayPicker
                    value={dateWithMin}
                    onValueChange={setDateWithMin}
                    min={minDate}
                />
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="tp-b2-semibold">With Max Date</h3>
                <DayPicker
                    value={dateWithMax}
                    onValueChange={setDateWithMax}
                    max={maxDate}
                />
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="tp-b2-semibold">With Min + Max</h3>
                <DayPicker
                    value={dateWithMinMax}
                    onValueChange={setDateWithMinMax}
                    min={minDate}
                    max={maxDate}
                />
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="tp-b2-semibold">Disabled</h3>
                <DayPicker
                    value={disabledDate}
                    onValueChange={setDisabledDate}
                    disabled={true}
                />
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="tp-b2-semibold">
                    In Field (label + disabled via context)
                </h3>
                <Field label="Appointment date" disabled={true} required={false}>
                    <DayPicker value={fieldDate} onValueChange={setFieldDate} />
                </Field>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="tp-b2-semibold">In Field (with description)</h3>
                <Field
                    label="Delivery date"
                    description="Pick the day the package should arrive."
                    required={false}
                >
                    <DayPicker value={describedDate} onValueChange={setDescribedDate} />
                </Field>
            </div>
        </div>
    )
}
