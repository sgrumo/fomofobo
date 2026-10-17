// Lives as long as the loaded document: a full load starts it over.
const visitedPaths: { landing: string | undefined; moved: boolean } = {
    landing: undefined,
    moved: false,
}

/**
 * @description Records a pathname the app shows, so a later page knows whether the history
 * holds a page of the app
 * @param pathname Pathname shown
 */
export const recordInAppPath = (pathname: string): void => {
    if (visitedPaths.landing === undefined) {
        visitedPaths.landing = pathname
    } else if (pathname !== visitedPaths.landing) {
        visitedPaths.moved = true
    }
}

/**
 * @description True when the app navigated at least once since the document loaded
 */
export const hasInAppHistory = (): boolean => visitedPaths.moved
