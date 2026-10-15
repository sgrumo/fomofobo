import { createContext, useContext } from "react"

export interface TableContext {
    columns: number | null
    setColumns: (columns: number) => void
}

export const TableContext = createContext<TableContext | null>(null)
export const useTableContext = () => useContext(TableContext)
