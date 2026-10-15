import { cn } from "frontend-shared/styles"
import { Button } from "ui-components/button"
import { IconPlus } from "ui-components/icons"

const icon = <IconPlus className="size-4" />

interface ButtonShowcaseProps {
    className?: string
}
export const ButtonShowcase = (props: ButtonShowcaseProps) => (
    <div className={cn("flex flex-col gap-6", props.className)}>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Primary</p>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="md" type="button">
                    Medium
                </Button>
                <Button variant="primary" size="sm" type="button">
                    Small
                </Button>
                <Button variant="primary" size="icon" type="button" icon={icon} />
                <Button variant="primary" size="md" type="button" icon={icon}>
                    Icon Start
                </Button>
                <Button variant="primary" size="sm" type="button" icon={icon}>
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                >
                    Icon End
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                >
                    Icon End
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="md" type="button" disabled={true}>
                    Medium
                </Button>
                <Button variant="primary" size="sm" type="button" disabled={true}>
                    Small
                </Button>
                <Button
                    variant="primary"
                    size="icon"
                    type="button"
                    icon={icon}
                    disabled={true}
                />
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    icon={icon}
                    disabled={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    icon={icon}
                    disabled={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    disabled={true}
                >
                    Icon End
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    disabled={true}
                >
                    Icon End
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="md" type="button" loading={true}>
                    Medium
                </Button>
                <Button variant="primary" size="sm" type="button" loading={true}>
                    Small
                </Button>
                <Button
                    variant="primary"
                    size="icon"
                    type="button"
                    icon={icon}
                    loading={true}
                />
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    icon={icon}
                    loading={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    icon={icon}
                    loading={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    loading={true}
                >
                    Icon End
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    loading={true}
                >
                    Icon End
                </Button>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Primary Destructive</p>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="md" type="button" destructive={true}>
                    Medium
                </Button>
                <Button variant="primary" size="sm" type="button" destructive={true}>
                    Small
                </Button>
                <Button
                    variant="primary"
                    size="icon"
                    type="button"
                    destructive={true}
                    icon={icon}
                />
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    destructive={true}
                    icon={icon}
                >
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    destructive={true}
                    icon={icon}
                >
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    destructive={true}
                    icon={icon}
                    iconPosition="end"
                >
                    Icon End
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    destructive={true}
                    icon={icon}
                    iconPosition="end"
                >
                    Icon End
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    destructive={true}
                    disabled={true}
                >
                    Medium
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    destructive={true}
                    disabled={true}
                >
                    Small
                </Button>
                <Button
                    variant="primary"
                    size="icon"
                    type="button"
                    destructive={true}
                    icon={icon}
                    disabled={true}
                />
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    destructive={true}
                    icon={icon}
                    disabled={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    destructive={true}
                    icon={icon}
                    disabled={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    destructive={true}
                    icon={icon}
                    iconPosition="end"
                    disabled={true}
                >
                    Icon End
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    destructive={true}
                    icon={icon}
                    iconPosition="end"
                    disabled={true}
                >
                    Icon End
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    destructive={true}
                    loading={true}
                >
                    Medium
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    destructive={true}
                    loading={true}
                >
                    Small
                </Button>
                <Button
                    variant="primary"
                    size="icon"
                    type="button"
                    destructive={true}
                    icon={icon}
                    loading={true}
                />
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    destructive={true}
                    icon={icon}
                    loading={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    destructive={true}
                    icon={icon}
                    loading={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    destructive={true}
                    icon={icon}
                    iconPosition="end"
                    loading={true}
                >
                    Icon End
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    destructive={true}
                    icon={icon}
                    iconPosition="end"
                    loading={true}
                >
                    Icon End
                </Button>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Secondary</p>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="secondary" size="md" type="button">
                    Medium
                </Button>
                <Button variant="secondary" size="sm" type="button">
                    Small
                </Button>
                <Button variant="secondary" size="icon" type="button" icon={icon} />
                <Button variant="secondary" size="md" type="button" icon={icon}>
                    Icon Start
                </Button>
                <Button variant="secondary" size="sm" type="button" icon={icon}>
                    Icon Start
                </Button>
                <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                >
                    Icon End
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                >
                    Icon End
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="secondary" size="md" type="button" disabled={true}>
                    Medium
                </Button>
                <Button variant="secondary" size="sm" type="button" disabled={true}>
                    Small
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    type="button"
                    icon={icon}
                    disabled={true}
                />
                <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    icon={icon}
                    disabled={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    icon={icon}
                    disabled={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    disabled={true}
                >
                    Icon End
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    disabled={true}
                >
                    Icon End
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="secondary" size="md" type="button" loading={true}>
                    Medium
                </Button>
                <Button variant="secondary" size="sm" type="button" loading={true}>
                    Small
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    type="button"
                    icon={icon}
                    loading={true}
                />
                <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    icon={icon}
                    loading={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    icon={icon}
                    loading={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    loading={true}
                >
                    Icon End
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    loading={true}
                >
                    Icon End
                </Button>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Tertiary</p>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="tertiary" size="md" type="button">
                    Medium
                </Button>
                <Button variant="tertiary" size="sm" type="button">
                    Small
                </Button>
                <Button variant="tertiary" size="icon" type="button" icon={icon} />
                <Button variant="tertiary" size="md" type="button" icon={icon}>
                    Icon Start
                </Button>
                <Button variant="tertiary" size="sm" type="button" icon={icon}>
                    Icon Start
                </Button>
                <Button
                    variant="tertiary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                >
                    Icon End
                </Button>
                <Button
                    variant="tertiary"
                    size="sm"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                >
                    Icon End
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="tertiary" size="md" type="button" disabled={true}>
                    Medium
                </Button>
                <Button variant="tertiary" size="sm" type="button" disabled={true}>
                    Small
                </Button>
                <Button
                    variant="tertiary"
                    size="icon"
                    type="button"
                    icon={icon}
                    disabled={true}
                />
                <Button
                    variant="tertiary"
                    size="md"
                    type="button"
                    icon={icon}
                    disabled={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="tertiary"
                    size="sm"
                    type="button"
                    icon={icon}
                    disabled={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="tertiary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    disabled={true}
                >
                    Icon End
                </Button>
                <Button
                    variant="tertiary"
                    size="sm"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    disabled={true}
                >
                    Icon End
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="tertiary" size="md" type="button" loading={true}>
                    Medium
                </Button>
                <Button variant="tertiary" size="sm" type="button" loading={true}>
                    Small
                </Button>
                <Button
                    variant="tertiary"
                    size="icon"
                    type="button"
                    icon={icon}
                    loading={true}
                />
                <Button
                    variant="tertiary"
                    size="md"
                    type="button"
                    icon={icon}
                    loading={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="tertiary"
                    size="sm"
                    type="button"
                    icon={icon}
                    loading={true}
                >
                    Icon Start
                </Button>
                <Button
                    variant="tertiary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    loading={true}
                >
                    Icon End
                </Button>
                <Button
                    variant="tertiary"
                    size="sm"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    loading={true}
                >
                    Icon End
                </Button>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Stretched (grid)</p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Button variant="primary" size="md" type="button">
                    No icon
                </Button>
                <Button variant="primary" size="md" type="button" icon={icon}>
                    Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                >
                    Icon End
                </Button>
                <Button variant="primary" size="md" type="button" loading={true}>
                    Loading
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    icon={icon}
                    loading={true}
                >
                    Loading Icon Start
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    icon={icon}
                    iconPosition="end"
                    loading={true}
                >
                    Loading Icon End
                </Button>
                <Button variant="secondary" size="md" type="button" icon={icon}>
                    Secondary
                </Button>
                <Button variant="secondary" size="md" type="button" loading={true}>
                    Secondary loading
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    destructive={true}
                    icon={icon}
                    iconPosition="end"
                    loading={true}
                >
                    Destructive loading
                </Button>
            </div>
        </div>
    </div>
)
