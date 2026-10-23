import { useNetInfo } from "@react-native-community/netinfo"

/**
 * @description Returns false while the device reports no connection
 * @remarks Returns true before the first NetInfo answer
 */
export const useOnline = () => useNetInfo().isConnected !== false
