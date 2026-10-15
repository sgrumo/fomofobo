import { useState } from "react"
import { Field } from "ui-components/field"
import { Slider } from "ui-components/slider"

export const SliderSamples = () => {
    const [value, setValue] = useState(30)

    return (
        <div className="flex w-full max-w-[20rem] flex-col gap-4">
            <Field label="Sample Slider" required={false}>
                <Slider
                    value={value}
                    onValueChange={setValue}
                    min={0}
                    max={100}
                    step={1}
                />
            </Field>
            <p>Slider value: {value}</p>
        </div>
    )
}
