"use client"

import "./globals.css"
import { defaultLanguage } from "i18n/i18n"

import { ErrorView } from "@/components/client/error-view/error-view"

interface GlobalErrorProps {
    error: Error
}

// Catches a failure of the root layout itself, so it renders its own document.
const GlobalError = (props: GlobalErrorProps) => (
    <html lang={defaultLanguage}>
        <body>
            <ErrorView
                error={props.error}
                kind="global"
                className="h-[100dvh] w-[100dvw]"
            />
        </body>
    </html>
)

export default GlobalError
