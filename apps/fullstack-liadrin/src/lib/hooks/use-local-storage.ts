import {
    // SAFETY: this is one of the pre-built createUseWebStorage hooks
    // oxlint-disable-next-line eslint/no-restricted-imports
    createUseWebStorage,
} from "react-shared"

import { localStorage } from "@/lib/storage/local-storage"

export const useLocalStorage = createUseWebStorage(localStorage)
