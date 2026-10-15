import { cn } from "frontend-shared/styles"
import { Separator } from "ui-components/separator"

interface SeparatorShowcaseProps {
    className?: string
}
export const SeparatorShowcase = (props: SeparatorShowcaseProps) => (
    <div className={cn("grid grid-cols-1 gap-8 lg:grid-cols-2", props.className)}>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Horizontal</p>
            <div className="flex flex-col gap-2">
                <span className="tp-b2-regular text-neutral-600 dark:text-neutral-300">
                    Above
                </span>
                <Separator />
                <span className="tp-b2-regular text-neutral-600 dark:text-neutral-300">
                    Below
                </span>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Vertical</p>
            <div className="flex h-16 items-center gap-4">
                <span className="tp-b2-regular text-neutral-600 dark:text-neutral-300">
                    Left
                </span>
                <Separator orientation="vertical" />
                <span className="tp-b2-regular text-neutral-600 dark:text-neutral-300">
                    Right
                </span>
            </div>
        </div>
    </div>
)
