const skippedKeys = new Set(["parent", "loc", "range"])

const walk = (node, visit) => {
    if (!node || typeof node !== "object" || !node.type) {
        return
    }

    visit(node)

    for (const key of Object.keys(node)) {
        if (skippedKeys.has(key)) {
            continue
        }
        const value = node[key]
        if (Array.isArray(value)) {
            for (const item of value) {
                walk(item, visit)
            }
        } else {
            walk(value, visit)
        }
    }
}

const stringLiteralsOf = node => {
    const array = node?.type === "TSAsExpression" ? node.expression : node
    if (array?.type !== "ArrayExpression" || array.elements.length === 0) {
        return undefined
    }

    const literals = array.elements.filter(
        element => element?.type === "Literal" && typeof element.value === "string",
    )

    return literals.length === array.elements.length ? literals : undefined
}

const isZodEnumCallee = callee =>
    callee.type === "MemberExpression" &&
    callee.object?.type === "Identifier" &&
    callee.object.name === "z" &&
    callee.property?.type === "Identifier" &&
    callee.property.name === "enum"

const isPgEnumCallee = callee => callee.type === "Identifier" && callee.name === "pgEnum"

const nonKebabPattern = /[A-Z_\s]/u

const toKebabCase = value =>
    value
        .replaceAll(/[\s_]+/gu, "-")
        .replaceAll(/(?<lower>[a-z\d])(?<upper>\p{Lu})/gu, "$<lower>-$<upper>")
        .toLowerCase()

export const kebabCaseEnumValues = {
    meta: {
        type: "problem",
        messages: {
            kebabCaseEnumValue:
                'Enum value "{{value}}" is not kebab-case. Use "{{suggestion}}".',
        },
    },
    create(context) {
        const reported = new Set()

        const reportLiterals = literals => {
            for (const literal of literals) {
                if (reported.has(literal) || !nonKebabPattern.test(literal.value)) {
                    continue
                }
                reported.add(literal)
                context.report({
                    node: literal,
                    messageId: "kebabCaseEnumValue",
                    data: {
                        value: literal.value,
                        suggestion: toKebabCase(literal.value),
                    },
                })
            }
        }

        return {
            Program(program) {
                const arrayNames = new Map()
                const referencedNames = []

                walk(program, node => {
                    if (
                        node.type === "VariableDeclarator" &&
                        node.id?.type === "Identifier"
                    ) {
                        const literals = stringLiteralsOf(node.init)
                        if (literals) {
                            arrayNames.set(node.id.name, literals)
                        }
                        return
                    }

                    if (node.type !== "CallExpression") {
                        return
                    }

                    const isPgEnum = isPgEnumCallee(node.callee)
                    if (!isPgEnum && !isZodEnumCallee(node.callee)) {
                        return
                    }

                    const valuesArgument = node.arguments[isPgEnum ? 1 : 0]
                    const literals = stringLiteralsOf(valuesArgument)

                    if (literals) {
                        reportLiterals(literals)
                    } else if (valuesArgument?.type === "Identifier") {
                        referencedNames.push(valuesArgument.name)
                    }
                })

                for (const name of referencedNames) {
                    const literals = arrayNames.get(name)
                    if (literals) {
                        reportLiterals(literals)
                    }
                }
            },
        }
    },
}
