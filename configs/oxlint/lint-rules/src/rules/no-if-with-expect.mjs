const assertionHint = `Use TypeScript assertion functions instead.

Example assertion function:

  function assertIsTreatment(
    service: Service,
  ): asserts service is Extract<Service, { type: "Treatment" }> {
    expect(service.type).toBe("Treatment")
  }

  assertIsTreatment(service)
  expect(service.price).toBeDefined()`

const containsExpectCall = node => {
    if (!node || typeof node !== "object") {
        return false
    }

    if (
        node.type === "CallExpression" &&
        node.callee?.type === "Identifier" &&
        node.callee.name === "expect"
    ) {
        return true
    }

    for (const key of Object.keys(node)) {
        if (key === "parent" || key === "loc" || key === "range") {
            continue
        }
        const value = node[key]
        if (Array.isArray(value)) {
            for (const item of value) {
                if (
                    item &&
                    typeof item === "object" &&
                    item.type &&
                    containsExpectCall(item)
                ) {
                    return true
                }
            }
        } else if (
            value &&
            typeof value === "object" &&
            value.type &&
            containsExpectCall(value)
        ) {
            return true
        }
    }

    return false
}

export const noIfWithExpect = {
    meta: {
        type: "problem",
        messages: {
            noIfWithExpect: `Avoid using expect() calls inside if blocks. ${assertionHint}`,
            noElseWithExpect: `Avoid using expect() calls inside else blocks. ${assertionHint}`,
            noElseIfWithExpect: `Avoid using expect() calls inside else-if blocks. ${assertionHint}`,
        },
    },
    create(context) {
        return {
            IfStatement(node) {
                const isElseIf =
                    node.parent.type === "IfStatement" && node.parent.alternate === node

                if (containsExpectCall(node.consequent)) {
                    context.report({
                        node,
                        messageId: isElseIf ? "noElseIfWithExpect" : "noIfWithExpect",
                    })
                }

                if (
                    node.alternate &&
                    node.alternate.type !== "IfStatement" &&
                    containsExpectCall(node.alternate)
                ) {
                    context.report({
                        node,
                        messageId: "noElseWithExpect",
                    })
                }
            },
        }
    },
}
