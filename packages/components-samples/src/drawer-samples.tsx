import { Button } from "ui-components/button"
import {
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerRoot,
    DrawerTitle,
    DrawerTrigger,
} from "ui-components/drawer"

export const DrawerSamples = () => (
    <DrawerRoot side="right">
        <DrawerTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open sample drawer
                </Button>
            }
        />
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>Sample drawer</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
                <p>Sample drawer body</p>
            </DrawerBody>
        </DrawerContent>
    </DrawerRoot>
)
