export const preferExpectStatus = {
    meta: {
        type: "suggestion",
        fixable: "code",
        messages: {
            preferExpectStatus:
                "Use expectStatus({{object}}, {{status}}) instead of expect({{object}}.status).{{matcher}}({{status}})",
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                if (
                    node.callee.type !== "MemberExpression" ||
                    node.callee.property?.type !== "Identifier" ||
                    (node.callee.property.name !== "toBe" &&
                        node.callee.property.name !== "toEqual")
                ) {
                    return
                }

                const matcherName = node.callee.property.name
                const expectCall = node.callee.object

                if (
                    !expectCall ||
                    expectCall.type !== "CallExpression" ||
                    expectCall.callee?.type !== "Identifier" ||
                    expectCall.callee.name !== "expect" ||
                    expectCall.arguments.length !== 1
                ) {
                    return
                }

                const [expectArg] = expectCall.arguments

                if (
                    expectArg.type !== "MemberExpression" ||
                    expectArg.property?.type !== "Identifier" ||
                    expectArg.property.name !== "status" ||
                    node.arguments.length === 0
                ) {
                    return
                }

                const [statusArg] = node.arguments
                if (statusArg.type !== "Literal" || typeof statusArg.value !== "number") {
                    return
                }

                const objectName = context.sourceCode.getText(expectArg.object)
                const statusValue = context.sourceCode.getText(statusArg)

                context.report({
                    node,
                    messageId: "preferExpectStatus",
                    data: {
                        object: objectName,
                        status: statusValue,
                        matcher: matcherName,
                    },
                    fix(fixer) {
                        return fixer.replaceText(
                            node,
                            `expectStatus(${objectName}, ${statusValue})`,
                        )
                    },
                })
            },
        }
    },
}
