import { noop } from "es-toolkit"
import { useState } from "react"
import { Field } from "ui-components/field"
import { Slider } from "ui-components/slider"

export const SliderShowcase = () => {
    const [smValue, setSmValue] = useState(50)
    const [mdValue, setMdValue] = useState(50)
    const [describedValue, setDescribedValue] = useState(50)

    return (
        <div className="flex w-full max-w-[20rem] flex-col gap-6">
            <div className="flex flex-col gap-2">
                <p className="tp-h4-medium">Sm</p>
                <Field label="Volume" required={false}>
                    <Slider value={smValue} onValueChange={setSmValue} size="sm" />
                </Field>
            </div>
            <div className="flex flex-col gap-2">
                <p className="tp-h4-medium">Md</p>
                <Field label="Volume" required={false}>
                    <Slider value={mdValue} onValueChange={setMdValue} size="md" />
                </Field>
            </div>
            <div className="flex flex-col gap-2">
                <p className="tp-h4-medium">Disabled</p>
                <Field label="Volume" disabled={true} required={false}>
                    <Slider value={30} onValueChange={noop} size="sm" />
                </Field>
            </div>
            <div className="flex flex-col gap-2">
                <p className="tp-h4-medium">With description</p>
                <Field
                    label="Volume"
                    description="Sets the playback volume from 0 to 100."
                    required={false}
                >
                    <Slider
                        value={describedValue}
                        onValueChange={setDescribedValue}
                        size="sm"
                    />
                </Field>
            </div>
        </div>
    )
}
