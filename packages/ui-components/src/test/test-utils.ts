import type { RenderOptions } from "@testing-library/react"
import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import type { StrictOmit } from "shared/types"

import { TestProviders } from "./global-providers"

/**
 * @description Renders the node inside the package test providers
 * @param node Node rendered
 * @param options Testing Library options, without the wrapper
 */
const customRender = (node: ReactNode, options?: StrictOmit<RenderOptions, "wrapper">) =>
    render(node, { wrapper: TestProviders, ...options })

export * from "@testing-library/react"
export { customRender as render }
