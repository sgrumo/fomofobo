import { useState } from "react"
import { SearchField } from "ui-components/search-field"

export const SearchFieldShowcase = () => {
    const [value, setValue] = useState("")

    return (
        <div className="bg-map-ground flex w-full max-w-[24rem] flex-col gap-3 p-3">
            <SearchField
                label="Search"
                placeholder="Search event, place, date"
                value={value}
                onValueChange={setValue}
            />
        </div>
    )
}
