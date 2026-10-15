import { Button } from "ui-components/button"
import {
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverRoot,
    PopoverTitle,
    PopoverTrigger,
} from "ui-components/popover"

export const PopoverSamples = () => (
    <PopoverRoot>
        <PopoverTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open sample popover
                </Button>
            }
        />
        <PopoverContent>
            <PopoverHeader>
                <PopoverTitle>Sample popover</PopoverTitle>
            </PopoverHeader>
            <PopoverDescription>Sample popover body</PopoverDescription>
        </PopoverContent>
    </PopoverRoot>
)
