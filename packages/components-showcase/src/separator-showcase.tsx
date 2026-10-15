import { cn } from "frontend-shared/styles"
import { Separator } from "ui-components/separator"

interface SeparatorShowcaseProps {
    className?: string
}
export const SeparatorShowcase = (props: SeparatorShowcaseProps) => (
    <div className={cn("grid grid-cols-1 gap-8 lg:grid-cols-2", props.className)}>
        <div className="flex flex-col gap-2">
            <p className="tp-pixel-lg">Horizontal</p>
            <div className="flex flex-col gap-2">
                <span className="tp-body-md text-fg-muted">Above</span>
                <Separator />
                <span className="tp-body-md text-fg-muted">Below</span>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-pixel-lg">Vertical</p>
            <div className="flex h-16 items-center gap-4">
                <span className="tp-body-md text-fg-muted">Left</span>
                <Separator orientation="vertical" />
                <span className="tp-body-md text-fg-muted">Right</span>
            </div>
        </div>
    </div>
)
