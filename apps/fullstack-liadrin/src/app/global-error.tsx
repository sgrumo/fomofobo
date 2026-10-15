"use client"

import "./globals.css"
import { ErrorView } from "@/components/client/error-view/error-view"

interface GlobalErrorProps {
    error: Error
}

// Catches a failure of the root layout itself, so it renders its own document.
const GlobalError = (props: GlobalErrorProps) => (
    <html lang="en">
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
