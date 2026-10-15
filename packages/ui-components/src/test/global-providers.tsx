import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { UiProvider } from "../provider/ui-provider"
import { createToastManager } from "../toast/toast.helper"
import { testLocale, testT } from "./ui-i18n"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const toastManager = createToastManager({ t: testT })

interface TestProvidersProps {
    children?: ReactNode
}

export const TestProviders = (props: TestProvidersProps) => (
    <UiProvider
        i18n={{ t: testT, dateFns: { locale: testLocale } }}
        isDev={false}
        toastManager={toastManager.base}
    >
        <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    </UiProvider>
)
