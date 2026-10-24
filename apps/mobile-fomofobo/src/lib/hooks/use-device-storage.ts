import { createUseWebStorage } from "react-shared"

import { deviceStorage } from "@/lib/storage/device-storage"

export const useDeviceStorage = createUseWebStorage(deviceStorage)
