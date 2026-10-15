import { defineConfig } from "oxlint"

import webConfig from "./oxlint.config.web.ts"
import { reactPlugins } from "./shared.ts"

export default defineConfig({
    extends: [webConfig],
    plugins: [...reactPlugins],
    // NOTE: `settings` is NOT inherited through `extends` - each consumer must
    // declare `settings.react.version` locally
    rules: {
        // react - native
        "react/display-name": "off",
        "react/no-unsafe": "off",
        "react/react-in-jsx-scope": "off",
        "react/jsx-max-depth": "off",
        "react/jsx-filename-extension": "off",
        "react/no-multi-comp": "off",
        "react/jsx-no-useless-fragment": "off",
        "react/no-set-state": "off",
        "react/forbid-component-props": "off",
        "react/no-object-type-as-default-prop": "off",
        "react/no-unstable-nested-components": "off",
        "react/jsx-no-constructed-context-values": "off",
        "react/jsx-no-literals": "off",
        "react/jsx-props-no-spreading": [
            "error",
            { html: "ignore", exceptions: ["Link"] },
        ],
        "react/jsx-key": ["error", { checkFragmentShorthand: true }],
        "react/button-has-type": [
            "error",
            {
                button: true,
                submit: true,
                reset: false,
            },
        ],
        "react/jsx-boolean-value": ["error", "always"],
        "react/jsx-curly-brace-presence": [
            "error",
            { props: "never", children: "never", propElementValues: "always" },
        ],
        "react/jsx-fragments": ["error", "syntax"],
        "react/function-component-definition": [
            "error",
            {
                namedComponents: "arrow-function",
                unnamedComponents: "arrow-function",
            },
        ],
        "react/todo": "off",

        // react perf - native
        "react-perf/jsx-no-new-object-as-prop": "off",
        "react-perf/jsx-no-new-array-as-prop": "off",
        "react-perf/jsx-no-new-function-as-prop": "off",
        "react-perf/jsx-no-jsx-as-prop": "off",

        // jsx-a11y - native
        "jsx-a11y/media-has-caption": "off",
        "jsx-a11y/prefer-tag-over-role": "off",
    },
})
