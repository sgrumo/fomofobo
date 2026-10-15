const marker = 'import "server-only"'

const isServerOnlyImport = statement =>
    statement.type === "ImportDeclaration" &&
    statement.importKind !== "type" &&
    statement.source.value === "server-only"

export const requireServerOnly = {
    meta: {
        type: "problem",
        fixable: "code",
        messages: {
            requireServerOnly: `Add \`${marker}\` so a client bundle fails the build when it includes this module.`,
        },
    },
    create(context) {
        return {
            Program(node) {
                if (node.body.some(isServerOnlyImport)) {
                    return
                }

                context.report({
                    node,
                    messageId: "requireServerOnly",
                    fix(fixer) {
                        return fixer.insertTextBeforeRange([0, 0], `${marker}\n`)
                    },
                })
            },
        }
    },
}
