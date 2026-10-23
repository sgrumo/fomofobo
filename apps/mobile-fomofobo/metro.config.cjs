// @ts-check
const path = require("path")
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, "../..")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot)

config.watchFolders = [monorepoRoot]

config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(monorepoRoot, "node_modules"),
]

config.resolver.unstable_enablePackageExports = true

// Resolved from the app: a workspace package otherwise gets its own copy, outside the context of the app
const singletons = ["@tanstack/react-query", "i18next", "react-i18next"]
const appOrigin = path.join(projectRoot, "package.json")

config.resolver.resolveRequest = (context, moduleName, platform) =>
    singletons.some(name => moduleName === name || moduleName.startsWith(`${name}/`))
        ? context.resolveRequest(
              { ...context, originModulePath: appOrigin },
              moduleName,
              platform,
          )
        : context.resolveRequest(context, moduleName, platform)

// A rem of 16 points keeps the spacing scale equal to the web app, `h-11` a 44 pt target included
module.exports = withNativeWind(config, { input: "./src/global.css", inlineRem: 16 })
