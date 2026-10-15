import { existsSync, readdirSync, readFileSync } from "node:fs"
import type { Dirent } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { routes } from "@/framework/routes/routes"

const sourceDirectory = import.meta.dirname
const appDirectory = path.join(sourceDirectory, "app")
const componentsDirectory = path.join(sourceDirectory, "components")

const pageDirectoryName = "_page"
const boundaryDirectoryNames = new Set(["client", "server"])
const useClientDirective = '"use client"'
const componentExtension = ".tsx"

// Files Next reads by name. They sit beside the route, outside `_page`.
const conventionFileNames = new Set([
    "page",
    "layout",
    "template",
    "default",
    "loading",
    "error",
    "global-error",
    "not-found",
    "route",
    "sitemap",
    "robots",
    "manifest",
    "opengraph-image",
    "twitter-image",
    "icon",
    "apple-icon",
])

const routePropsReference = /\bRouteClientComponentProps<"(?<key>\w+)">/gu
const routeHookCall = /\buse(?:Static|Dynamic)Route\((?<argument>[^)]*)\)/gu
const routeHookArgument = "routes[props.route]"
const trailingComma = /,$/u

/**
 * @description Returns every entry below the directory, none when the directory is absent
 * @param directory Directory walked
 */
const entriesUnder = (directory: string) =>
    existsSync(directory)
        ? readdirSync(directory, { recursive: true, withFileTypes: true })
        : []

/**
 * @description Returns the path of every file below the directory with the extension
 * @param directory Directory walked
 * @param extension Extension looked for, dot included
 */
const filesUnder = (directory: string, extension: string): string[] =>
    entriesUnder(directory)
        .filter(entry => entry.isFile() && entry.name.endsWith(extension))
        .map(entry => path.join(entry.parentPath, entry.name))

/**
 * @description Returns the path of every directory below the root with the name
 * @param root Directory walked
 * @param name Directory name looked for
 */
const directoriesNamed = (root: string, name: string): string[] =>
    entriesUnder(root)
        .filter(entry => entry.isDirectory() && entry.name === name)
        .map(entry => path.join(entry.parentPath, entry.name))

/**
 * @description Returns the path relative to `src`, for a readable assertion
 * @param file Absolute path
 */
const relative = (file: string): string => path.relative(sourceDirectory, file)

/**
 * @description Returns the source of the file
 * @param file Absolute path
 */
const sourceOf = (file: string): string => readFileSync(file, "utf8")

/**
 * @description True when the file opens with the `"use client"` directive
 * @param file Absolute path
 */
const opensWithUseClient = (file: string): boolean =>
    sourceOf(file).split("\n")[0] === useClientDirective

/**
 * @description Returns the path of every component file of the boundary directories below
 * the root
 * @param root Directory walked
 * @param boundary Boundary directory name
 */
const boundaryFilesUnder = (root: string, boundary: string): string[] =>
    directoriesNamed(root, boundary).flatMap(directory =>
        filesUnder(directory, componentExtension),
    )

const pageDirectories = directoriesNamed(appDirectory, pageDirectoryName)

/**
 * @description Returns the key of the route the `_page` directory belongs to
 * @param pageDirectory Absolute path of the `_page` directory
 * @remarks Drops the route group folders, which hold no URL segment, as the ledger does
 */
const routeKeyOf = (pageDirectory: string): string | undefined => {
    const segments = path
        .relative(appDirectory, path.dirname(pageDirectory))
        .split(path.sep)
        .filter(segment => segment !== "" && !segment.startsWith("("))
        .join("/")

    return Object.entries(routes).find(
        ([, route]) => route.segments.join("/") === segments,
    )?.[0]
}

/**
 * @description Returns the `_page` directory the file sits in
 * @param file Absolute path of a file below an `_page` directory
 */
const pageDirectoryOf = (file: string): string => {
    const parts = file.split(path.sep)
    return parts.slice(0, parts.indexOf(pageDirectoryName) + 1).join(path.sep)
}

/**
 * @description True when the file is inside an `_page` directory
 * @param file Absolute path
 */
const isPageComponentFile = (file: string): boolean =>
    file.split(path.sep).includes(pageDirectoryName)

/**
 * @description Returns the route keys the file names in `RouteClientComponentProps`
 * @param file Absolute path
 */
const routePropsKeysOf = (file: string): string[] =>
    Array.from(sourceOf(file).matchAll(routePropsReference))
        .map(found => found.groups?.key)
        .filter(key => key !== undefined)

/**
 * @description Returns the argument of every route hook call in the file
 * @param file Absolute path
 * @remarks Drops the trailing comma the formatter writes on a wrapped call
 */
const routeHookArgumentsOf = (file: string): string[] =>
    Array.from(sourceOf(file).matchAll(routeHookCall))
        .map(found => found.groups?.argument?.trim().replace(trailingComma, "").trim())
        .filter(argument => argument !== undefined)

/**
 * @description True when the directory holds `client` and `server` directories alone, one
 * at least
 * @param directory Absolute path of an `_page` directory
 */
const holdsBoundariesAlone = (directory: string): boolean => {
    const entries = readdirSync(directory, { withFileTypes: true })
    return (
        entries.length > 0 &&
        entries.every(
            entry => entry.isDirectory() && boundaryDirectoryNames.has(entry.name),
        )
    )
}

/**
 * @description True when the file names `RouteClientComponentProps` of the route of its
 * page, once at least, and of no other route
 * @param file Absolute path of a route client component
 */
const typesRouteProps = (file: string): boolean => {
    const key = routeKeyOf(pageDirectoryOf(file))
    const keys = routePropsKeysOf(file)
    return keys.length > 0 && keys.every(found => found === key)
}

/**
 * @description True when every route hook call of the file passes the `route` prop
 * @param file Absolute path of a route client component
 */
const readsRouteHooksFromProps = (file: string): boolean =>
    routeHookArgumentsOf(file).every(argument => argument === routeHookArgument)

/**
 * @description True when the entry is a `client` or `server` directory
 * @param entry Entry of the `components` directory
 */
const isBoundaryDirectory = (entry: Dirent): boolean =>
    entry.isDirectory() && boundaryDirectoryNames.has(entry.name)

/**
 * @description Returns the absolute path of the entry
 * @param entry Entry read with `withFileTypes`
 */
const pathOf = (entry: Dirent): string => path.join(entry.parentPath, entry.name)

/**
 * @description True when the entry is a directory holding one `.tsx` file, named as the
 * directory, and no nested directory
 * @param entry Entry of a boundary directory
 */
const isComponentDirectory = (entry: Dirent): boolean => {
    if (!entry.isDirectory()) {
        return false
    }

    const entries = readdirSync(pathOf(entry), { withFileTypes: true })
    const componentFiles = entries.filter(
        child => child.isFile() && child.name.endsWith(componentExtension),
    )
    return (
        entries.every(child => !child.isDirectory()) &&
        componentFiles.length === 1 &&
        componentFiles[0]?.name === `${entry.name}${componentExtension}`
    )
}

/**
 * @description Returns every entry of the boundary directory, files included
 * @param boundary Boundary directory name
 */
const boundaryEntriesOf = (boundary: string): Dirent[] =>
    readdirSync(path.join(componentsDirectory, boundary), { withFileTypes: true })

/**
 * @description True when the file is a Next convention file or sits in an `_page`
 * directory
 * @param file Absolute path of a file of `src/app`
 */
const isPlacedAppFile = (file: string): boolean =>
    isPageComponentFile(file) ||
    conventionFileNames.has(path.basename(file, path.extname(file)))

describe("`_page` directories", () => {
    it("should sit beside a `page.tsx`", () => {
        const orphans = pageDirectories
            .filter(
                directory => !existsSync(path.join(path.dirname(directory), "page.tsx")),
            )
            .map(relative)
        expect(orphans).toStrictEqual([])
    })

    it("should describe a route of the ledger", () => {
        const unknown = pageDirectories
            .filter(directory => routeKeyOf(directory) === undefined)
            .map(relative)
        expect(unknown).toStrictEqual([])
    })

    it("should hold `client` and `server` directories alone, one at least", () => {
        const malformed = pageDirectories
            .filter(directory => !holdsBoundariesAlone(directory))
            .map(relative)
        expect(malformed).toStrictEqual([])
    })
})

describe("route client components", () => {
    const files = boundaryFilesUnder(appDirectory, "client").filter(isPageComponentFile)

    it("should exist for the pages that render a client tree", () => {
        expect(files.length).toBeGreaterThan(0)
    })

    it(`should open with ${useClientDirective}`, () => {
        const missing = files.filter(file => !opensWithUseClient(file)).map(relative)
        expect(missing).toStrictEqual([])
    })

    it("should type their props with `RouteClientComponentProps` of the route of their page", () => {
        const mistyped = files.filter(file => !typesRouteProps(file)).map(relative)
        expect(mistyped).toStrictEqual([])
    })

    it("should read a route hook with the `route` prop alone", () => {
        const wrongArguments = files
            .filter(file => !readsRouteHooksFromProps(file))
            .map(relative)
        expect(wrongArguments).toStrictEqual([])
    })
})

describe("server components", () => {
    const files = [
        ...boundaryFilesUnder(appDirectory, "server").filter(isPageComponentFile),
        ...boundaryFilesUnder(componentsDirectory, "server"),
    ]

    it(`should open with no ${useClientDirective}`, () => {
        const marked = files.filter(opensWithUseClient).map(relative)
        expect(marked).toStrictEqual([])
    })
})

describe("`components` directory", () => {
    const boundaryDirectories = readdirSync(componentsDirectory, { withFileTypes: true })

    it("should hold `client` and `server` directories alone", () => {
        const foreign = boundaryDirectories
            .filter(entry => !isBoundaryDirectory(entry))
            .map(entry => entry.name)
        expect(foreign).toStrictEqual([])
    })

    it("should give every component its own directory, holding one `.tsx` file of the same name", () => {
        const malformed = boundaryDirectories
            .flatMap(boundary => boundaryEntriesOf(boundary.name))
            .filter(entry => !isComponentDirectory(entry))
            .map(entry => relative(pathOf(entry)))
        expect(malformed).toStrictEqual([])
    })

    it(`should open every client component with ${useClientDirective}`, () => {
        const missing = boundaryFilesUnder(componentsDirectory, "client")
            .filter(file => !opensWithUseClient(file))
            .map(relative)
        expect(missing).toStrictEqual([])
    })
})

describe("`app` directory", () => {
    it("should hold Next convention files outside `_page` alone", () => {
        const stray = [
            ...filesUnder(appDirectory, ".tsx"),
            ...filesUnder(appDirectory, ".ts"),
        ]
            .filter(file => !isPlacedAppFile(file))
            .map(relative)
        expect(stray).toStrictEqual([])
    })
})
