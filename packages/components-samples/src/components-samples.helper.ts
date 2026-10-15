import { z } from "zod"

export const fruitSchema = z.object({
    id: z.string(),
    label: z.string(),
})
export type Fruit = z.infer<typeof fruitSchema>

export const fruits: Fruit[] = [
    { id: "1", label: "Apple" },
    { id: "2", label: "Banana" },
    { id: "3", label: "Cherry" },
    { id: "4", label: "Durian" },
    { id: "5", label: "Elderberry" },
]
