import { useState } from "react"
import { TabsIndicator, TabsList, TabsPanel, TabsRoot, TabsTab } from "ui-components/tabs"

export const TabsSamples = () => {
    const [value, setValue] = useState<string | number>("one")

    return (
        <TabsRoot value={value} onValueChange={setValue}>
            <TabsList>
                <TabsTab value="one">Tab One</TabsTab>
                <TabsTab value="two">Tab Two</TabsTab>
                <TabsIndicator />
            </TabsList>
            <TabsPanel value="one">
                <p>Tab one panel content</p>
            </TabsPanel>
            <TabsPanel value="two">
                <p>Tab two panel content</p>
            </TabsPanel>
        </TabsRoot>
    )
}
