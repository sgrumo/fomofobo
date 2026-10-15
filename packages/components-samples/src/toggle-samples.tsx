import { capitalize } from "es-toolkit"
import { useState } from "react"
import { Toggle, ToggleGroup } from "ui-components/toggle"
import { z } from "zod"

const fruitNameSchema = z.enum(["apple", "banana", "cherry"])
type FruitName = z.infer<typeof fruitNameSchema>
const fruitNames: FruitName[] = ["apple", "banana", "cherry"]

export const ToggleSamples = () => {
    const [pressed, setPressed] = useState(false)
    const [groupValue, setGroupValue] = useState<FruitName | undefined>(undefined)

    return (
        <div className="flex flex-col items-start gap-4">
            <Toggle pressed={pressed} onPressedChange={setPressed}>
                Sample Toggle
            </Toggle>
            <ToggleGroup
                multiple={false}
                itemSchema={fruitNameSchema}
                items={fruitNames}
                getItemLabel={item => `${capitalize(item)} Toggle`}
                renderItem={({ item }) => <span>{capitalize(item)}</span>}
                value={groupValue}
                onValueChange={setGroupValue}
                className="flex w-fit items-center gap-2"
            />
        </div>
    )
}
