export interface SearchEdges {
    west: number
    south: number
    east: number
    north: number
}

// Steps of the grid in degrees, from a few blocks to several regions
const GRID_STEPS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5] as const
// A box spans at most this many steps on its longer side, so it grows by one step at most
const MAX_STEPS_PER_SIDE = 4
// Absorbs the error of a float division at a line of the grid
const GRID_EPSILON = 1e-9

/**
 * @description Returns a value in degrees rounded to six decimals, about ten centimeters
 * @param degrees Value rounded
 */
const roundDegrees = (degrees: number): number => Number(degrees.toFixed(6))

/**
 * @description Returns the box that holds a box with its edges on a grid that grows with its size, so close boxes of one size share their edges
 * @param box Edges of the box
 */
export const snapToSearchGrid = (box: SearchEdges): SearchEdges => {
    const span = Math.max(box.north - box.south, box.east - box.west)
    const step =
        GRID_STEPS.find(candidate => candidate * MAX_STEPS_PER_SIDE >= span) ??
        Math.max(...GRID_STEPS)
    const down = (degrees: number) =>
        roundDegrees(Math.floor(degrees / step + GRID_EPSILON) * step)
    const up = (degrees: number) =>
        roundDegrees(Math.ceil(degrees / step - GRID_EPSILON) * step)
    return {
        west: down(box.west),
        south: down(box.south),
        east: up(box.east),
        north: up(box.north),
    }
}
