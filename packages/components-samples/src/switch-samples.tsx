import { useState } from "react"
import { Field } from "ui-components/field"
import { Switch } from "ui-components/switch"

export const SwitchSamples = () => {
    const [value, setValue] = useState(false)

    return (
        <Field label="Sample Switch" labelSide="right" required={false}>
            <Switch value={value} onValueChange={setValue} />
        </Field>
    )
}
