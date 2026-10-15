import {
    // SAFETY: this is one of the pre-built createUseWebStorage hooks
    // oxlint-disable-next-line eslint/no-restricted-imports
    createUseWebStorage,
} from "react-shared"

import { sessionStorage } from "@/lib/storage/session-storage"

export const useSessionStorage = createUseWebStorage(sessionStorage)
