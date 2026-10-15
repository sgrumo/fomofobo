import { useState } from "react"
import { Button } from "ui-components/button"
import {
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "ui-components/dialog"
import { Field } from "ui-components/field"
import { StringInput } from "ui-components/string-input"

export const DialogSamples = () => {
    const [inputValue, setInputValue] = useState<string | undefined>(undefined)

    return (
        <DialogRoot>
            <DialogTrigger
                render={
                    <Button variant="secondary" size="md" type="button">
                        Open sample dialog
                    </Button>
                }
            />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sample dialog</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <p>Sample dialog body</p>
                    <Field label="Dialog Input" required={false}>
                        <StringInput
                            value={inputValue}
                            onValueChange={setInputValue}
                            className="w-full"
                        />
                    </Field>
                </DialogBody>
            </DialogContent>
        </DialogRoot>
    )
}
