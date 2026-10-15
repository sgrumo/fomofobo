"use client"

import { useMutation } from "@tanstack/react-query"
import type { FileMetadata } from "models"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "ui-components/button"
import { TableCell, TableRow } from "ui-components/table"

import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { formatFileSize } from "@/lib/upload/format-file-size"

interface FileRowProps extends RouteClientComponentProps<"files"> {
    file: FileMetadata
}

export const FileRow = (props: FileRowProps) => {
    const { t } = useTranslation("files")
    const [downloading, setDownloading] = useState(false)

    const { mutate: deleteFile, isPending: deleting } = useMutation(
        api.deleteFileMutation,
    )

    const onDownload = () => {
        setDownloading(true)
        const run = async () => {
            try {
                const download = await api.getFileDownloadUrl({
                    params: { id: props.file.id },
                    query: {},
                })
                window.open(download.url, "_blank", "noopener,noreferrer")
            } finally {
                setDownloading(false)
            }
        }
        void run()
    }

    const onDelete = () => {
        deleteFile({ id: props.file.id })
    }

    return (
        <TableRow>
            <TableCell>{props.file.fileName}</TableCell>
            <TableCell>{props.file.contentType}</TableCell>
            <TableCell>{formatFileSize(props.file.sizeBytes)}</TableCell>
            <TableCell>{new Date(props.file.createdAt).toLocaleString()}</TableCell>
            <TableCell ellipsis={false}>
                <div className="flex gap-2">
                    <Button
                        variant="tertiary"
                        size="sm"
                        type="button"
                        onClick={onDownload}
                        disabled={downloading}
                        className="shrink-0"
                    >
                        {t("Download")}
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        type="button"
                        destructive={true}
                        onClick={onDelete}
                        disabled={deleting}
                        className="shrink-0"
                    >
                        {t("Delete")}
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}
