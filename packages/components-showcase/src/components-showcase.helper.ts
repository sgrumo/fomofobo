import type { ComponentType, ReactNode } from "react"
import { z } from "zod"

// The showcase has no app context, so the host app injects its own boundary.
export type ErrorBoundaryComponent = ComponentType<{
    children?: ReactNode
    className?: string
}>

/**
 * @description Returns the parse signature of a form state, with the error map already bound
 * @template TOutput Schema output type
 * @remarks Injected by the host app, which binds its own language and error map
 */
export type FormStateParser = <TOutput>(
    schema: z.ZodType<TOutput>,
    data: unknown,
) => z.ZodSafeParseResult<TOutput>

export const fruitSchema = z.object({
    id: z.string(),
    label: z.string(),
    color: z.string(),
})
export type Fruit = z.infer<typeof fruitSchema>

export const fruits: Fruit[] = [
    { id: "1", label: "Apple", color: "#e74c3c" },
    { id: "2", label: "Banana", color: "#f1c40f" },
    { id: "3", label: "Cherry", color: "#c0392b" },
    { id: "4", label: "Date", color: "#8b4513" },
    { id: "5", label: "Elderberry", color: "#4b0082" },
    { id: "6", label: "Fig", color: "#6b4226" },
    { id: "7", label: "Grape", color: "#6f2da8" },
    { id: "8", label: "Honeydew", color: "#c1e1c1" },
    { id: "9", label: "Iris", color: "#5b21b6" },
    { id: "10", label: "Jackfruit", color: "#d4a017" },
    { id: "11", label: "Kiwi", color: "#6b8e23" },
    { id: "12", label: "Lemon", color: "#fff44f" },
    { id: "13", label: "Mango", color: "#ff8243" },
    { id: "14", label: "Nectarine", color: "#ff6347" },
]
