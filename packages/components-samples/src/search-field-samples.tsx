import { useState } from "react"
import { SearchField } from "ui-components/search-field"

export const SearchFieldSamples = () => {
    const [value, setValue] = useState("")

    return (
        <div className="flex w-full max-w-[20rem] flex-col gap-2">
            <SearchField
                label="Sample search"
                placeholder="Sample search placeholder"
                value={value}
                onValueChange={setValue}
            />
            <span>{`Search value: ${value}`}</span>
        </div>
    )
}
