import { cn } from "frontend-shared/styles"
import { useId, useState } from "react"
import { match } from "ts-pattern"
import { Button } from "ui-components/button"
import {
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "ui-components/dialog"

interface DialogShowcaseProps {
    className?: string
}
export const DialogShowcase = (props: DialogShowcaseProps) => (
    <div className={cn("flex flex-col gap-6", props.className)}>
        <p className="tp-pixel-lg">Basic</p>
        <DialogBasicShowcase />
        <p className="tp-pixel-lg">Nested</p>
        <DialogNestedShowcase />
        <p className="tp-pixel-lg">Focus on Close</p>
        <DialogFocusOnCloseShowcase />
    </div>
)

const DialogBasicShowcase = () => (
    <DialogRoot>
        <DialogTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open Dialog
                </Button>
            }
        />
        <DialogContent className={dialogContentClassName}>
            <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
            <DialogBody>
                <DialogDescription>{dialogDescription}</DialogDescription>
                {dialogBody}
            </DialogBody>
            <DialogFooter className="grid grid-cols-2 gap-2">
                <DialogClose
                    render={
                        <Button variant="secondary" size="md" type="button">
                            Close
                        </Button>
                    }
                />
                <Button variant="primary" size="md" type="button">
                    Submit
                </Button>
            </DialogFooter>
        </DialogContent>
    </DialogRoot>
)

const DialogNestedShowcase = () => (
    <DialogRoot>
        <DialogTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open Dialog
                </Button>
            }
        />
        <DialogContent className={dialogContentClassName}>
            <DialogHeader>
                <DialogTitle>Outer Dialog</DialogTitle>
            </DialogHeader>
            <DialogBody>{dialogBody}</DialogBody>
            <DialogFooter className="grid grid-cols-2 gap-2">
                <DialogRoot>
                    <DialogTrigger
                        render={
                            <Button variant="secondary" size="md" type="button">
                                Open Nested
                            </Button>
                        }
                    />
                    <DialogContent className={nestedDialogContentClassName}>
                        <DialogHeader>
                            <DialogTitle>Inner Dialog</DialogTitle>
                        </DialogHeader>
                        <DialogBody>{dialogBody}</DialogBody>
                        <DialogFooter>
                            <DialogClose
                                render={
                                    <Button variant="secondary" size="md" type="button">
                                        Close
                                    </Button>
                                }
                            />
                        </DialogFooter>
                    </DialogContent>
                </DialogRoot>
                <DialogClose
                    render={
                        <Button variant="secondary" size="md" type="button">
                            Close
                        </Button>
                    }
                />
            </DialogFooter>
        </DialogContent>
    </DialogRoot>
)

const DialogFocusOnCloseShowcase = () => {
    const [active, setActive] = useState<"A" | "B">("A")
    const buttonAId = useId()
    const buttonBId = useId()
    const focusTargetId = match(active)
        .with("A", () => buttonAId)
        .with("B", () => buttonBId)
        .exhaustive()

    return (
        <DialogRoot
            onOpenChange={open => {
                if (open) {
                    setActive(active === "A" ? "B" : "A")
                }
            }}
            triggerId={focusTargetId}
        >
            {active === "A" && (
                <DialogTrigger
                    id={buttonAId}
                    render={
                        <Button variant="secondary" size="md" type="button">
                            Open from A
                        </Button>
                    }
                />
            )}
            {active === "B" && (
                <DialogTrigger
                    id={buttonBId}
                    render={
                        <Button variant="secondary" size="md" type="button">
                            Open from B
                        </Button>
                    }
                />
            )}
            <DialogContent className={dialogContentClassName}>
                <DialogHeader>
                    <DialogTitle>Focus on Close</DialogTitle>
                </DialogHeader>
                <DialogBody>{dialogBody}</DialogBody>
                <DialogFooter className="grid grid-cols-2 gap-2">
                    <DialogClose
                        render={
                            <Button variant="secondary" size="md" type="button">
                                Close
                            </Button>
                        }
                    />
                    <Button variant="primary" size="md" type="button">
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    )
}

const dialogContentClassName = "max-w-[calc(min(40rem_,90dvw))]"
const nestedDialogContentClassName = "max-w-[calc(min(28rem_,90dvw))]"
const dialogDescription = "A short description of what this dialog is about."
const dialogBody = (
    <p className="tp-body-md text-fg">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien augue.
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
        doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
        veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </p>
)
