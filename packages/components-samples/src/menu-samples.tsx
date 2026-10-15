import { useState } from "react"
import { Button } from "ui-components/button"
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "ui-components/menu"

export const MenuSamples = () => {
    const [selected, setSelected] = useState<"none" | "one">("none")

    return (
        <div className="flex flex-col items-start gap-4">
            <MenuRoot>
                <MenuTrigger
                    render={
                        <Button variant="secondary" size="md" type="button">
                            Open sample menu
                        </Button>
                    }
                    className="w-fit"
                />
                <MenuContent>
                    <MenuItem
                        onClick={() => {
                            setSelected("one")
                        }}
                    >
                        Menu Action One
                    </MenuItem>
                    <MenuItem>Menu Action Two</MenuItem>
                </MenuContent>
            </MenuRoot>
            <p>Menu selected: {selected}</p>
        </div>
    )
}
