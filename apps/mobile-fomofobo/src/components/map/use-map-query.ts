import { mapQuerySchema } from "domain/map-query"
import type { MapQuery } from "domain/map-query"
import { router, useLocalSearchParams } from "expo-router"
import { z } from "zod"

/**
 * @description Returns the filters and the selection of the map screen, decoded from its route
 * params, and a setter that writes a change back to them
 * @remarks Clears a param that the change sets to undefined
 */
export const useMapQuery = () => {
    const query = mapQuerySchema.parse(useLocalSearchParams())

    const setQuery = (change: MapQuery) => {
        router.setParams(z.encode(mapQuerySchema, change))
    }

    return { query, setQuery }
}
