"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { FallbackBox } from "ui-components/fallback-box"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "ui-components/table"

import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"

import { FileRow } from "./file-row"

type FilesTableProps = RouteClientComponentProps<"files">

export const FilesTable = (props: FilesTableProps) => {
    const { t } = useTranslation("files")

    const {
        data: files,
        isLoading: filesLoading,
        isError: filesError,
    } = useQuery(api.listFilesQuery({ params: {}, query: {} }))

    return (
        <>
            {filesLoading && (
                <p className="tp-b1-regular text-neutral-500 dark:text-neutral-400">
                    {t("Loading")}
                </p>
            )}
            {filesError && (
                <p className="tp-b1-regular text-danger-600 dark:text-danger-400">
                    {t("Error")}
                </p>
            )}
            {files !== undefined && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[35%]">{t("ColumnName")}</TableHead>
                            <TableHead className="w-[20%]">{t("ColumnType")}</TableHead>
                            <TableHead className="w-[12%]">{t("ColumnSize")}</TableHead>
                            <TableHead className="w-[18%]">
                                {t("ColumnCreatedAt")}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t("ColumnActions")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        showEmptyFallback={files.length === 0}
                        emptyFallback={
                            <div className="py-12">
                                <FallbackBox type="empty" title={t("Empty")} />
                            </div>
                        }
                    >
                        {files.map(file => (
                            <FileRow key={file.id} route={props.route} file={file} />
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    )
}
