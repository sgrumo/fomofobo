import { useState } from "react"
import { Button } from "ui-components/button"
import { IconXMark } from "ui-components/icons"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "ui-components/table"

import type { Fruit } from "./components-samples.helper"
import { fruits } from "./components-samples.helper"

const fruitColors: Record<string, string> = {
    Apple: "Red",
    Banana: "Yellow",
    Cherry: "Dark red",
}

export const TableSamples = () => {
    const [rows, setRows] = useState<Fruit[]>(fruits.slice(0, 3))
    const removeRow = (id: string) => {
        setRows(current => current.filter(row => row.id !== id))
    }

    return (
        <div className="flex w-full flex-col gap-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Name</TableHead>
                        <TableHead className="w-[40%]">Color</TableHead>
                        <TableHead className="w-[20%]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody showEmptyFallback={false}>
                    {rows.map(row => (
                        <TableRow key={row.id}>
                            <TableCell>{row.label}</TableCell>
                            <TableCell>{fruitColors[row.label]}</TableCell>
                            <TableCell>
                                <Button
                                    variant="tertiary"
                                    size="icon"
                                    type="button"
                                    icon={<IconXMark className="size-4" />}
                                    aria-label={`Remove ${row.label}`}
                                    onClick={() => {
                                        removeRow(row.id)
                                    }}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50%]">Name</TableHead>
                        <TableHead className="w-[50%]">Color</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody showEmptyFallback={true} />
            </Table>
        </div>
    )
}
