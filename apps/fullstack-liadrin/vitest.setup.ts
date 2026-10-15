import { vi } from "vitest"

// Server modules open with `import "server-only"`. Next resolves that marker to an
// empty module in a React Server bundle and to a throw everywhere else. Tests are
// "everywhere else", so mock it once here.
vi.mock("server-only", () => ({}))
