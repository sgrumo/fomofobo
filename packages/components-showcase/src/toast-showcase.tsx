import { cn } from "frontend-shared/styles"
import { Button } from "ui-components/button"
import { toastDataSchema, useToast } from "ui-components/toast"
import type { ToastInput } from "ui-components/toast"

const shortTitle = "Info Toast"
const longTitle =
    "This is a very long toast title that is meant to test how the toast component handles long titles"
const longMessage =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."

const emptyToastParse = toastDataSchema.safeParse({})

const apiValidationButtons: ToastButton[] = emptyToastParse.success
    ? []
    : [
          {
              label: "API validation",
              toast: {
                  type: "error",
                  error: { type: "api-validation", zodError: emptyToastParse.error },
              },
          },
      ]

interface ToastButton {
    label: string
    toast: ToastInput
}

interface ToastSection {
    heading: string
    buttons: ToastButton[]
}

const sections: ToastSection[] = [
    {
        heading: "Info",
        buttons: [
            {
                label: "With message",
                toast: {
                    type: "info",
                    title: shortTitle,
                    messages: ["Toast description"],
                },
            },
            { label: "No message", toast: { type: "info", title: shortTitle } },
            { label: "Long title", toast: { type: "info", title: longTitle } },
            {
                label: "Long description",
                toast: { type: "info", title: shortTitle, messages: [longMessage] },
            },
        ],
    },
    {
        heading: "Success",
        buttons: [
            { label: "With message", toast: { type: "success", messages: ["Done"] } },
            {
                label: "Long description",
                toast: { type: "success", messages: [longMessage] },
            },
        ],
    },
    {
        heading: "Warning",
        buttons: [
            {
                label: "With message",
                toast: { type: "warning", messages: ["Heads up"] },
            },
            {
                label: "Long description",
                toast: { type: "warning", messages: [longMessage] },
            },
        ],
    },
    {
        heading: "Error",
        buttons: [
            {
                label: "Generic",
                toast: {
                    type: "error",
                    error: { type: "generic", messages: ["Generic error message"] },
                },
            },
            {
                label: "Long description",
                toast: {
                    type: "error",
                    error: { type: "generic", messages: [longMessage] },
                },
            },
            {
                label: "API known",
                toast: {
                    type: "error",
                    error: {
                        type: "api",
                        unknown: false,
                        status: 500,
                        messages: ["API error message"],
                    },
                },
            },
            {
                label: "API unknown",
                toast: {
                    type: "error",
                    error: { type: "api", unknown: true },
                },
            },
            ...apiValidationButtons,
        ],
    },
    {
        heading: "Common",
        buttons: [{ label: "Form validation error", toast: "form-validation-error" }],
    },
]

interface ToastShowcaseProps {
    className?: string
}
export const ToastShowcase = (props: ToastShowcaseProps) => {
    const toast = useToast()

    return (
        <div className={cn("flex flex-col gap-4", props.className)}>
            {sections.map(section => (
                <div key={section.heading} className="flex flex-col gap-4">
                    <p className="tp-pixel-lg">{section.heading}</p>
                    <div className="flex flex-wrap gap-4">
                        {section.buttons.map(button => (
                            <Button
                                key={button.label}
                                variant="secondary"
                                size="sm"
                                type="button"
                                onClick={() => {
                                    toast.add(button.toast)
                                }}
                                className="w-fit"
                            >
                                {button.label}
                            </Button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
