import { useState } from "react"
import {
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    AccordionRoot,
    AccordionTrigger,
} from "ui-components/accordion"
import { Button } from "ui-components/button"

export const AccordionSamples = () => {
    const [value, setValue] = useState<string[]>([])
    const [action, setAction] = useState("none")

    return (
        <AccordionRoot
            value={value}
            onValueChange={setValue}
            multiple={false}
            className="w-full"
        >
            <AccordionItem value="first">
                <AccordionTrigger>Accordion First Item</AccordionTrigger>
                <AccordionPanel>
                    <AccordionContent>First item accordion content</AccordionContent>
                </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="second">
                <AccordionTrigger>Accordion Second Item</AccordionTrigger>
                <AccordionPanel>
                    <AccordionContent>Second item accordion content</AccordionContent>
                </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="third">
                <AccordionHeader>
                    <AccordionTrigger
                        nativeButton={false}
                        render={triggerProps => <div {...triggerProps} />}
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="min-w-0 grow truncate">
                                Accordion Third Item
                            </span>
                            <Button
                                variant="tertiary"
                                size="sm"
                                type="button"
                                onClick={() => {
                                    setAction("third")
                                }}
                            >
                                Third item action
                            </Button>
                        </div>
                    </AccordionTrigger>
                </AccordionHeader>
                <AccordionPanel>
                    <AccordionContent>Third item accordion content</AccordionContent>
                </AccordionPanel>
            </AccordionItem>
            <span>Accordion action: {action}</span>
        </AccordionRoot>
    )
}
