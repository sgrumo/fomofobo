"use client"

import { useMutation } from "@tanstack/react-query"
import { allowedUploadContentTypes, MAX_UPLOAD_SIZE_BYTES } from "models"
import type { ChangeEvent } from "react"
import { useRef } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "ui-components/button"
import { useToast } from "ui-components/toast"

import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { formatFileSize } from "@/lib/upload/format-file-size"
import { validateUploadFile } from "@/lib/upload/validate-upload-file"

type FileUploadButtonProps = RouteClientComponentProps<"files">

export const FileUploadButton = (_props: FileUploadButtonProps) => {
    const { t } = useTranslation("files")
    const toast = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { mutate: uploadFile, isPending: uploading } = useMutation(
        api.uploadFileMutation,
    )

    const showError = (message: string) =>
        toast.add({ type: "error", error: { type: "generic", messages: [message] } })

    const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) {
            return
        }

        const validation = validateUploadFile(file)
        if (!validation.success) {
            showError(
                validation.error === "too-large"
                    ? t("Validation.TooLarge", {
                          max: formatFileSize(MAX_UPLOAD_SIZE_BYTES),
                      })
                    : t("Validation.DisallowedType"),
            )
            return
        }

        uploadFile(file, {
            onError: () => {
                showError(t("UploadError"))
            },
        })
    }

    return (
        <div className="flex items-center gap-3">
            <input
                ref={fileInputRef}
                type="file"
                accept={allowedUploadContentTypes.join(",")}
                onChange={onFileSelected}
                className="hidden"
                tabIndex={-1}
                aria-label={t("Upload")}
            />
            <Button
                variant="primary"
                size="md"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? t("Uploading") : t("Upload")}
            </Button>
        </div>
    )
}
