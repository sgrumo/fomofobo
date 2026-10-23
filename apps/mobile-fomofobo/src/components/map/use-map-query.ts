import { mapQuerySchema } from "domain/map-query"
import type { MapQuery } from "domain/map-query"
import { router, useLocalSearchParams } from "expo-router"
import { z } from "zod"

/**
 * @description Writes a change of the map query to the route params
 * @param change Keys changed
 * @remarks Clears a param that the change sets to undefined
 */
const setQuery = (change: MapQuery) => {
    router.setParams(z.encode(mapQuerySchema, change))
}

/**
 * @description Returns the filters and the selection of the map screen, decoded from its route
 * params, and a stable setter that writes a change back to them
 */
export const useMapQuery = () => {
    const query = mapQuerySchema.parse(useLocalSearchParams())
    return { query, setQuery }
}
