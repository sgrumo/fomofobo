import { useState } from "react"
import { Field } from "ui-components/field"
import { Switch } from "ui-components/switch"

export const SwitchShowcase = () => {
    const [smValue, setSmValue] = useState(false)
    const [mdValue, setMdValue] = useState(false)
    const [describedValue, setDescribedValue] = useState(false)
    const [smDisabledOffValue, setSmDisabledOffValue] = useState(false)
    const [smDisabledOnValue, setSmDisabledOnValue] = useState(true)
    const [mdDisabledOffValue, setMdDisabledOffValue] = useState(false)
    const [mdDisabledOnValue, setMdDisabledOnValue] = useState(true)

    return (
        <div className="flex w-full flex-col gap-8 lg:flex-row">
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Sm</p>
                <Field label="Enabled" labelSide="right" required={false}>
                    <Switch value={smValue} onValueChange={setSmValue} size="sm" />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Md</p>
                <Field label="Enabled" labelSide="right" required={false}>
                    <Switch value={mdValue} onValueChange={setMdValue} size="md" />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">With description</p>
                <Field
                    label="Notifications"
                    description="Turn on to receive email notifications."
                    labelSide="right"
                    required={false}
                >
                    <Switch
                        value={describedValue}
                        onValueChange={setDescribedValue}
                        size="md"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Sm disabled</p>
                <Field label="Off" disabled={true} labelSide="right" required={false}>
                    <Switch
                        value={smDisabledOffValue}
                        onValueChange={setSmDisabledOffValue}
                        size="sm"
                    />
                </Field>
                <Field label="On" disabled={true} labelSide="right" required={false}>
                    <Switch
                        value={smDisabledOnValue}
                        onValueChange={setSmDisabledOnValue}
                        size="sm"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Md disabled</p>
                <Field label="Off" disabled={true} labelSide="right" required={false}>
                    <Switch
                        value={mdDisabledOffValue}
                        onValueChange={setMdDisabledOffValue}
                        size="md"
                    />
                </Field>
                <Field label="On" disabled={true} labelSide="right" required={false}>
                    <Switch
                        value={mdDisabledOnValue}
                        onValueChange={setMdDisabledOnValue}
                        size="md"
                    />
                </Field>
            </div>
        </div>
    )
}
