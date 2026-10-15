import { useState } from "react"
import { Button } from "ui-components/button"
import { Field } from "ui-components/field"
import { StringInput } from "ui-components/string-input"
import { Textarea } from "ui-components/textarea"

import type { ErrorBoundaryComponent } from "./components-showcase.helper"

const Exploder = () => {
    throw new Error("Test error from ErrorBoundaryShowcase")
}

const ExplodingInput = () => {
    const [exploded, setExploded] = useState(false)

    if (exploded) {
        throw new Error("Test error from exploding input change")
    }

    return (
        <StringInput
            value={undefined}
            onValueChange={() => {
                setExploded(true)
            }}
            placeholder="Type to throw..."
            className="w-full"
        />
    )
}

const ExplodingTextarea = () => {
    const [exploded, setExploded] = useState(false)

    if (exploded) {
        throw new Error("Test error from exploding textarea change")
    }

    return (
        <Textarea
            value={undefined}
            onValueChange={() => {
                setExploded(true)
            }}
            placeholder="Type to throw..."
            className="w-full"
        />
    )
}

interface ErrorBoundaryShowcaseProps {
    errorBoundary: ErrorBoundaryComponent
}

export const ErrorBoundaryShowcase = (props: ErrorBoundaryShowcaseProps) => {
    const [exploded, setExploded] = useState(false)
    const ErrorBoundary = props.errorBoundary

    if (exploded) {
        return <Exploder />
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <Button
                variant="primary"
                size="md"
                type="button"
                destructive={true}
                onClick={() => {
                    setExploded(true)
                }}
            >
                Throw global error
            </Button>
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),18rem))] justify-center gap-4">
                <Field label="Exploding input" required={false}>
                    <ErrorBoundary className="w-full">
                        <ExplodingInput />
                    </ErrorBoundary>
                </Field>
                <Field label="Exploding textarea" required={false}>
                    <ErrorBoundary className="w-full">
                        <ExplodingTextarea />
                    </ErrorBoundary>
                </Field>
            </div>
            <Field label="Already exploded" className="w-[18rem]" required={false}>
                <ErrorBoundary className="w-full">
                    <Exploder />
                </ErrorBoundary>
            </Field>
        </div>
    )
}
