import { createContext, useContext } from "react"

export type FormMode = "edit" | "view"

export interface FormContext {
    mode: FormMode
    submittedAt: Date | null
}
export const FormContext = createContext<FormContext | null>(null)
export const useFormContext = () => useContext(FormContext)
