import path from "node:path"

/**
 * @description Returns the report name of the running package, plus the runner for a package with two
 * @param runner Runner of a package with two runners
 */
export const reportName = (runner?: string): string => {
    const name = process.env.npm_package_name ?? path.basename(process.cwd())
    return runner === undefined ? name : `${name}-${runner}`
}
