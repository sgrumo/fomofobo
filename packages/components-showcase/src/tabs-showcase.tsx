import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { TabsIndicator, TabsList, TabsPanel, TabsRoot, TabsTab } from "ui-components/tabs"

interface TabsShowcaseProps {
    className?: string
}
export const TabsShowcase = (props: TabsShowcaseProps) => (
    <div className={cn("flex w-full flex-col gap-6", props.className)}>
        <p className="tp-pixel-lg">Uncontrolled</p>
        <TabsUncontrolledShowcase />
        <p className="tp-pixel-lg">Controlled</p>
        <TabsControlledShowcase />
    </div>
)

const TabsUncontrolledShowcase = () => (
    <TabsRoot defaultValue="overview">
        <TabsList>
            <TabsTab value="overview">Overview</TabsTab>
            <TabsTab value="features">Features</TabsTab>
            <TabsTab value="docs">Documentation</TabsTab>
            <TabsTab value="disabled" disabled={true}>
                Disabled
            </TabsTab>
            <TabsIndicator />
        </TabsList>
        <TabsPanel value="overview">
            <p className="tp-body-md text-fg">
                This is the overview panel. Tabs allow organizing content into multiple
                panels, showing one at a time.
            </p>
        </TabsPanel>
        <TabsPanel value="features">
            <p className="tp-body-md text-fg">
                Features include keyboard navigation, animated indicator, disabled tabs,
                and both controlled and uncontrolled modes.
            </p>
        </TabsPanel>
        <TabsPanel value="docs">
            <p className="tp-body-md text-fg">
                Documentation for using the Tabs component in your application. Check the
                component source for the full API.
            </p>
        </TabsPanel>
        <TabsPanel value="disabled">
            <p className="tp-body-md text-fg">This panel should not be reachable.</p>
        </TabsPanel>
    </TabsRoot>
)

const TabsControlledShowcase = () => {
    const [value, setValue] = useState<string | number>("tab-1")

    return (
        <div className="flex flex-col gap-2">
            <p className="tp-body-sm text-fg-muted">Active tab: {value}</p>
            <TabsRoot value={value} onValueChange={setValue}>
                <TabsList>
                    <TabsTab value="tab-1">First</TabsTab>
                    <TabsTab value="tab-2">Second</TabsTab>
                    <TabsTab value="tab-3">Third</TabsTab>
                    <TabsIndicator />
                </TabsList>
                <TabsPanel value="tab-1">
                    <p className="tp-body-md text-fg">
                        Content for the first tab, controlled via state.
                    </p>
                </TabsPanel>
                <TabsPanel value="tab-2">
                    <p className="tp-body-md text-fg">
                        Content for the second tab, controlled via state.
                    </p>
                </TabsPanel>
                <TabsPanel value="tab-3">
                    <p className="tp-body-md text-fg">
                        Content for the third tab, controlled via state.
                    </p>
                </TabsPanel>
            </TabsRoot>
        </div>
    )
}
