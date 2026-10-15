import { useState } from "react"
import {
    AccordionContent,
    AccordionItem,
    AccordionPanel,
    AccordionRoot,
    AccordionTrigger,
} from "ui-components/accordion"

export const AccordionShowcase = () => (
    <div className="grid h-full w-full grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <AccordionSingleShowcase />
        <AccordionMultipleShowcase />
    </div>
)

const AccordionSingleShowcase = () => {
    const [value, setValue] = useState<string[]>([])

    return (
        <AccordionRoot
            value={value}
            onValueChange={setValue}
            className="w-full"
            multiple={false}
        >
            {panels.map(panel => (
                <AccordionItem key={panel} value={panel}>
                    <AccordionTrigger>{questions[panel]}</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>
                            {panel === "multiple"
                                ? answers[panel]({ multiple: false })
                                : answers[panel]}
                        </AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
            ))}
        </AccordionRoot>
    )
}

const AccordionMultipleShowcase = () => (
    <AccordionRoot multiple={true} className="w-full">
        {panels.map(panel => (
            <AccordionItem key={panel} value={panel}>
                <AccordionTrigger>{questions[panel]}</AccordionTrigger>
                <AccordionPanel>
                    <AccordionContent>
                        {panel === "multiple"
                            ? answers[panel]({ multiple: true })
                            : answers[panel]}
                    </AccordionContent>
                </AccordionPanel>
            </AccordionItem>
        ))}
    </AccordionRoot>
)

const panels = ["control", "accessibility", "multiple"] as const
const questions = {
    control: "How is it controlled?",
    accessibility: "Is it accessible?",
    multiple: "Does it allow multiple open panels?",
}
const answers = {
    control:
        "It can be handled in a controlled way through owned state or left uncontrolled",
    accessibility: "Yes. It adheres to the WAI-ARIA design pattern.",
    multiple: (opts: { multiple: boolean }) =>
        opts.multiple
            ? "Yes, you can open more than one panel at a time."
            : "No, you can only open one at a time.",
}
