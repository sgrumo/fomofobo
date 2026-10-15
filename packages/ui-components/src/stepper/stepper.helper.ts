export type StepCompletion = boolean | "partially"

export interface Step<S extends string = string> {
    id: S
    label: string
}
