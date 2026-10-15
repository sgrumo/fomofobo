import { capitalize } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { Button } from "ui-components/button"
import {
    DrawerBody,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerRoot,
    DrawerTitle,
    DrawerTrigger,
} from "ui-components/drawer"
import type { DrawerSide } from "ui-components/drawer"

interface DrawerShowcaseProps {
    className?: string
}
export const DrawerShowcase = (props: DrawerShowcaseProps) => (
    <div className={cn("flex flex-col gap-6", props.className)}>
        <p className="tp-h4-semibold">Top</p>
        <DrawerSidedShowcase side="top" />
        <p className="tp-h4-semibold">Right</p>
        <DrawerSidedShowcase side="right" />
        <p className="tp-h4-semibold">Bottom</p>
        <DrawerSidedShowcase side="bottom" />
        <p className="tp-h4-semibold">Left</p>
        <DrawerSidedShowcase side="left" />
    </div>
)

interface DrawerSidedShowcaseProps {
    side: DrawerSide
}
const DrawerSidedShowcase = (props: DrawerSidedShowcaseProps) => (
    <DrawerRoot side={props.side}>
        <DrawerTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open {capitalize(props.side)} Drawer
                </Button>
            }
        />
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>{capitalize(props.side)} Drawer</DrawerTitle>
                <DrawerDescription>
                    This drawer slides up from the {capitalize(props.side)} of the screen.
                </DrawerDescription>
            </DrawerHeader>
            <DrawerBody>{drawerBody}</DrawerBody>
        </DrawerContent>
    </DrawerRoot>
)

const drawerBody = (
    <p className="tp-b2-regular text-neutral-800 dark:text-neutral-100">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien augue.
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
        doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
        veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </p>
)
