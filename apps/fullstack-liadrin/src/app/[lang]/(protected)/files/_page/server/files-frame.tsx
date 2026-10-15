import "server-only"
import type { LanguageKey } from "i18n/i18n"

import { getNamespacedTranslation } from "@/lib/i18n/server/translation"

import { FileUploadButton } from "../client/file-upload-button"
import { FilesTable } from "../client/files-table"

interface FilesFrameProps {
    language: LanguageKey
}

export const FilesFrame = (props: FilesFrameProps) => {
    const t = getNamespacedTranslation(props.language, "files")

    return (
        <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-6 p-6">
            <h1 className="tp-h1">{t("Title")}</h1>
            <section className="flex flex-col gap-3">
                <FileUploadButton route="files" />
            </section>
            <section className="flex flex-col gap-4">
                <FilesTable route="files" />
            </section>
        </div>
    )
}
