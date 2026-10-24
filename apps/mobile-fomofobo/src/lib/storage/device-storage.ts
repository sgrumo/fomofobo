import AsyncStorage from "@react-native-async-storage/async-storage"
import { createWebStorage, storagePrefix } from "frontend-shared/storage"

import { createMirroredStorage } from "./mirrored-storage"
import { deviceStorageDefaults, deviceStorageSchema } from "./storage-keys"

const mirror = createMirroredStorage(AsyncStorage)

export const deviceStorage = createWebStorage(
    mirror.storage,
    deviceStorageSchema,
    deviceStorageDefaults,
    storagePrefix,
)

export const hydrateDeviceStorage = mirror.hydrate
