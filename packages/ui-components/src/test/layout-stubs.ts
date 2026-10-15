interface LayoutStub {
    prototype: object
    method: string
    value: () => unknown
}

const layoutStubs: LayoutStub[] = [
    { prototype: Range.prototype, method: "getClientRects", value: () => [] },
    { prototype: Text.prototype, method: "getClientRects", value: () => [] },
    {
        prototype: Range.prototype,
        method: "getBoundingClientRect",
        value: () => new DOMRect(0, 0, 0, 0),
    },
    {
        prototype: Text.prototype,
        method: "getBoundingClientRect",
        value: () => new DOMRect(0, 0, 0, 0),
    },
    { prototype: Document.prototype, method: "elementFromPoint", value: () => null },
]

const savedDescriptors = new Map<LayoutStub, PropertyDescriptor | undefined>()

/**
 * @description Defines the layout methods jsdom omits on `Range`, `Text`, and `Document`
 * @remarks Mutates shared prototypes, so it pairs with `restoreMissingLayoutApis` in an `afterAll` hook
 */
export const installMissingLayoutApis = (): void => {
    for (const stub of layoutStubs) {
        savedDescriptors.set(
            stub,
            Object.getOwnPropertyDescriptor(stub.prototype, stub.method),
        )
        Object.defineProperty(stub.prototype, stub.method, {
            value: stub.value,
            writable: true,
            configurable: true,
        })
    }
}

/**
 * @description Reverts every stub of `installMissingLayoutApis` to its original descriptor
 */
export const restoreMissingLayoutApis = (): void => {
    for (const stub of layoutStubs) {
        const saved = savedDescriptors.get(stub)
        if (saved === undefined) {
            Reflect.deleteProperty(stub.prototype, stub.method)
        } else {
            Object.defineProperty(stub.prototype, stub.method, saved)
        }
    }
    savedDescriptors.clear()
}
