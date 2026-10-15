import { cn } from "frontend-shared/styles"
import { Button } from "ui-components/button"
import { IconEye, IconInfo, IconPlus, IconWarningCircle } from "ui-components/icons"
import { Tooltip } from "ui-components/tooltip"

interface TooltipShowcaseProps {
    className?: string
}
export const TooltipShowcase = (props: TooltipShowcaseProps) => (
    <div className={cn("flex flex-col gap-6", props.className)}>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Active</p>
            <div className="flex flex-wrap items-center gap-8">
                <Tooltip
                    active={true}
                    content="Information tooltip"
                    position={{ sideOffset: 8 }}
                >
                    <IconInfo className="size-4 text-neutral-400 dark:text-neutral-500" />
                </Tooltip>
                <Tooltip
                    active={true}
                    content="View details"
                    position={{ sideOffset: 8 }}
                >
                    <IconEye className="size-4 text-neutral-400 dark:text-neutral-500" />
                </Tooltip>
                <Tooltip
                    active={true}
                    content="Add new item"
                    position={{ sideOffset: 8 }}
                >
                    <IconPlus className="size-4 text-neutral-400 dark:text-neutral-500" />
                </Tooltip>
                <Tooltip
                    active={true}
                    content="Warning: check this"
                    position={{ sideOffset: 8 }}
                >
                    <IconWarningCircle className="size-4 text-neutral-400 dark:text-neutral-500" />
                </Tooltip>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Positions</p>
            <div className="flex flex-wrap items-center gap-8">
                <Tooltip
                    active={true}
                    content="Top (default)"
                    position={{ side: "top", align: "center", sideOffset: 8 }}
                >
                    <IconInfo className="size-4 text-neutral-400 dark:text-neutral-500" />
                </Tooltip>
                <Tooltip
                    active={true}
                    content="Bottom"
                    position={{ side: "bottom", align: "center", sideOffset: 8 }}
                >
                    <IconInfo className="size-4 text-neutral-400 dark:text-neutral-500" />
                </Tooltip>
                <Tooltip
                    active={true}
                    content="Left"
                    position={{ side: "left", align: "center", sideOffset: 8 }}
                >
                    <IconInfo className="size-4 text-neutral-400 dark:text-neutral-500" />
                </Tooltip>
                <Tooltip
                    active={true}
                    content="Right"
                    position={{ side: "right", align: "center", sideOffset: 8 }}
                >
                    <IconInfo className="size-4 text-neutral-400 dark:text-neutral-500" />
                </Tooltip>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Disabled Button with Tooltip</p>
            <div className="flex flex-wrap items-center gap-8">
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    disabled={{
                        value: true,
                        tooltip: "You lack permissions",
                    }}
                >
                    Primary
                </Button>
                <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    disabled={{ value: true, tooltip: "Feature unavailable" }}
                >
                    Secondary
                </Button>
                <Button
                    variant="tertiary"
                    size="md"
                    type="button"
                    disabled={{ value: true, tooltip: "Coming soon" }}
                >
                    Tertiary
                </Button>
                <Button
                    variant="primary"
                    size="icon"
                    type="button"
                    icon={<IconPlus className="size-4" />}
                    disabled={{
                        value: true,
                        tooltip: "Cannot add more items",
                    }}
                />
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Inactive (no tooltip)</p>
            <div className="flex flex-wrap items-center gap-8">
                <Tooltip active={false} content="This won't show">
                    <IconInfo className="size-4 text-neutral-400 dark:text-neutral-500" />
                </Tooltip>
            </div>
        </div>
    </div>
)
