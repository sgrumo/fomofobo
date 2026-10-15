/**
 * @description Returns the env file `ENV_NAME` selects, or nothing when it is unset
 * @param envName Value of `ENV_NAME`
 */
export const envFileOf = (envName: string | undefined): string | undefined =>
    envName === undefined || envName === "" ? undefined : `.env.${envName}`

/**
 * @description Builds the child environment: the file variables under the shell ones,
 * without `NODE_ENV` of the file
 * @param fileVars Variables of the env file
 * @param shellEnv Environment of the wrapper
 */
export const mergeEnv = (
    fileVars: NodeJS.ProcessEnv,
    shellEnv: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv => {
    const { NODE_ENV: _ignored, ...kept } = fileVars
    return { ...kept, ...shellEnv }
}
