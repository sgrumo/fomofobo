import { capitalize } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { Button } from "ui-components/button"
import {
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverRoot,
    PopoverTitle,
    PopoverTrigger,
} from "ui-components/popover"

interface PopoverShowcaseProps {
    className?: string
}
export const PopoverShowcase = (props: PopoverShowcaseProps) => (
    <div className={cn("flex flex-col gap-6", props.className)}>
        <p className="tp-pixel-lg">Basic</p>
        <PopoverBasicShowcase />
        <p className="tp-pixel-lg">With Arrow</p>
        <PopoverWithArrowShowcase />
        <p className="tp-pixel-lg">Positions</p>
        <PopoverPositionsShowcase />
    </div>
)

const PopoverBasicShowcase = () => (
    <PopoverRoot>
        <PopoverTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open Popover
                </Button>
            }
        />
        <PopoverContent>
            <PopoverHeader>
                <PopoverTitle>Popover Title</PopoverTitle>
            </PopoverHeader>
            <PopoverDescription>
                This is a basic popover with a close button.
            </PopoverDescription>
        </PopoverContent>
    </PopoverRoot>
)

const PopoverWithArrowShowcase = () => (
    <PopoverRoot>
        <PopoverTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    With Arrow
                </Button>
            }
        />
        <PopoverContent showArrow={true}>
            <PopoverTitle>Arrow Popover</PopoverTitle>
            <PopoverDescription>
                This popover has an arrow pointing to the trigger.
            </PopoverDescription>
        </PopoverContent>
    </PopoverRoot>
)

const PopoverPositionsShowcase = () => (
    <div className="flex flex-wrap items-center gap-4">
        {(["top", "bottom", "left", "right"] as const).map(side => (
            <PopoverRoot key={side}>
                <PopoverTrigger
                    render={
                        <Button variant="secondary" size="sm" type="button">
                            {side}
                        </Button>
                    }
                />
                <PopoverContent showArrow={true} positionerProps={{ side }}>
                    <PopoverTitle>{capitalize(side)}</PopoverTitle>
                    <PopoverDescription>Positioned on the {side}.</PopoverDescription>
                </PopoverContent>
            </PopoverRoot>
        ))}
    </div>
)
