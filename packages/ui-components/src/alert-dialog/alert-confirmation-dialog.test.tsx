import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../button/button"
import { render, screen, waitFor } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import { AlertConfirmationDialog } from "./alert-confirmation-dialog"

const trigger = (
    <Button variant="primary" size="md" type="button">
        Open
    </Button>
)

describe("AlertConfirmationDialog", () => {
    describe("standard mode", () => {
        it("opens when trigger is clicked", async () => {
            const user = userEvent.setup()

            render(
                <AlertConfirmationDialog
                    trigger={trigger}
                    title="Are you sure?"
                    description="This cannot be undone."
                    onConfirm={vi.fn<() => void>()}
                />,
            )

            expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()

            await user.click(screen.getByRole("button", { name: "Open" }))

            expect(
                screen.getByRole("alertdialog", { name: "Are you sure?" }),
            ).toBeInTheDocument()
            expect(screen.getByText("This cannot be undone.")).toBeInTheDocument()
        })

        it("calls onConfirm and closes when confirm button is clicked", async () => {
            const user = userEvent.setup()
            const onConfirm = vi.fn<() => void>()

            render(
                <AlertConfirmationDialog
                    trigger={trigger}
                    title="Are you sure?"
                    description="This cannot be undone."
                    onConfirm={onConfirm}
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))
            await user.click(
                screen.getByRole("button", { name: t("Shared.Confirm", undefined) }),
            )

            expect(onConfirm).toHaveBeenCalledOnce()
            expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
        })

        it("closes without calling onConfirm when cancel is clicked", async () => {
            const user = userEvent.setup()
            const onConfirm = vi.fn<() => void>()

            render(
                <AlertConfirmationDialog
                    trigger={trigger}
                    title="Are you sure?"
                    description="This cannot be undone."
                    onConfirm={onConfirm}
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))
            await user.click(
                screen.getByRole("button", { name: t("Shared.Cancel", undefined) }),
            )

            expect(onConfirm).not.toHaveBeenCalled()
            expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
        })

        it("renders custom confirm and cancel labels", async () => {
            const user = userEvent.setup()

            render(
                <AlertConfirmationDialog
                    trigger={trigger}
                    title="Are you sure?"
                    description="This cannot be undone."
                    confirmLabel="Delete"
                    cancelLabel="Keep"
                    onConfirm={vi.fn<() => void>()}
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))

            expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument()
            expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument()
        })

        it("works in controlled mode", async () => {
            const user = userEvent.setup()
            const onConfirm = vi.fn<() => void>()

            const ControlledHarness = () => {
                const [open, setOpen] = useState(false)
                return (
                    <AlertConfirmationDialog
                        type="controlled"
                        open={open}
                        onOpenChange={setOpen}
                        trigger={trigger}
                        title="Are you sure?"
                        description="This cannot be undone."
                        onConfirm={onConfirm}
                    />
                )
            }

            render(<ControlledHarness />)

            await user.click(screen.getByRole("button", { name: "Open" }))
            expect(
                screen.getByRole("alertdialog", { name: "Are you sure?" }),
            ).toBeInTheDocument()

            await user.click(
                screen.getByRole("button", { name: t("Shared.Cancel", undefined) }),
            )
            expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
        })
    })

    describe("enter-to-confirm mode", () => {
        it("keeps confirm disabled and ignores clicks until the input matches", async () => {
            const user = userEvent.setup()
            const onConfirm = vi.fn<() => void>()

            render(
                <AlertConfirmationDialog
                    trigger={trigger}
                    title="Type to confirm"
                    description="Type the word below to enable the confirm button."
                    enterToConfirm="DELETE"
                    onConfirm={onConfirm}
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))

            const confirmButton = screen.getByRole("button", {
                name: t("Shared.Confirm", undefined),
            })
            expect(confirmButton).toHaveAttribute("aria-disabled", "true")

            await user.type(screen.getByPlaceholderText("DELETE"), "DEL")
            expect(confirmButton).toHaveAttribute("aria-disabled", "true")

            await user.click(confirmButton)
            expect(onConfirm).not.toHaveBeenCalled()
        })

        it("enables confirm and fires onConfirm once the input matches", async () => {
            const user = userEvent.setup()
            const onConfirm = vi.fn<() => void>()

            render(
                <AlertConfirmationDialog
                    trigger={trigger}
                    title="Type to confirm"
                    description="Type the word below to enable the confirm button."
                    enterToConfirm="DELETE"
                    onConfirm={onConfirm}
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))
            await user.type(screen.getByPlaceholderText("DELETE"), "DELETE")

            const confirmButton = screen.getByRole("button", {
                name: t("Shared.Confirm", undefined),
            })
            expect(confirmButton).toHaveAttribute("aria-disabled", "false")

            await user.click(confirmButton)
            expect(onConfirm).toHaveBeenCalledOnce()
            expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
        })

        it("disables confirm again if the user edits the input to no longer match", async () => {
            const user = userEvent.setup()

            render(
                <AlertConfirmationDialog
                    trigger={trigger}
                    title="Type to confirm"
                    description="Type the word below to enable the confirm button."
                    enterToConfirm="DELETE"
                    onConfirm={vi.fn<() => void>()}
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))
            const input = screen.getByPlaceholderText("DELETE")
            await user.type(input, "DELETE")

            const confirmButton = screen.getByRole("button", {
                name: t("Shared.Confirm", undefined),
            })
            expect(confirmButton).toHaveAttribute("aria-disabled", "false")

            await user.type(input, "X")
            expect(confirmButton).toHaveAttribute("aria-disabled", "true")
        })

        it("resets the confirmation input each time the dialog reopens", async () => {
            const user = userEvent.setup()

            render(
                <AlertConfirmationDialog
                    trigger={trigger}
                    title="Type to confirm"
                    description="Type the word below to enable the confirm button."
                    enterToConfirm="DELETE"
                    onConfirm={vi.fn<() => void>()}
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))
            await user.type(screen.getByPlaceholderText("DELETE"), "DELETE")
            expect(
                screen.getByRole("button", { name: t("Shared.Confirm", undefined) }),
            ).toHaveAttribute("aria-disabled", "false")

            await user.click(
                screen.getByRole("button", { name: t("Shared.Cancel", undefined) }),
            )
            await user.click(screen.getByRole("button", { name: "Open" }))

            expect(screen.getByPlaceholderText("DELETE")).toHaveValue("")
            expect(
                screen.getByRole("button", { name: t("Shared.Confirm", undefined) }),
            ).toHaveAttribute("aria-disabled", "true")
        })
    })

    describe("mutation mode", () => {
        it("opens when the trigger is clicked", async () => {
            const user = userEvent.setup()

            render(
                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="Deletion still pending"
                    trigger={trigger}
                    title="Delete user?"
                    description="This cannot be undone."
                    mutationOptions={{
                        mutationFn: vi
                            .fn<(variables: string) => Promise<void>>()
                            .mockResolvedValue(undefined),
                    }}
                    mutateOptions={{}}
                    variables="user-1"
                />,
            )

            expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()

            await user.click(screen.getByRole("button", { name: "Open" }))

            expect(
                screen.getByRole("alertdialog", { name: "Delete user?" }),
            ).toBeInTheDocument()
        })

        it("fires the mutation with the provided variables on confirm", async () => {
            const user = userEvent.setup()
            const mutationFn = vi
                .fn<(variables: string) => Promise<void>>()
                .mockResolvedValue(undefined)

            render(
                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="Deletion still pending"
                    trigger={trigger}
                    title="Delete user?"
                    description="This cannot be undone."
                    mutationOptions={{ mutationFn }}
                    mutateOptions={{}}
                    variables="user-1"
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))
            await user.click(
                screen.getByRole("button", { name: t("Shared.Confirm", undefined) }),
            )

            await waitFor(() => {
                expect(mutationFn).toHaveBeenCalledOnce()
            })
            expect(mutationFn).toHaveBeenCalledWith("user-1", expect.anything())
        })

        it("closes once the mutation resolves", async () => {
            const user = userEvent.setup()
            const mutationFn = vi
                .fn<(variables: string) => Promise<void>>()
                .mockResolvedValue(undefined)

            render(
                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="Deletion still pending"
                    trigger={trigger}
                    title="Delete user?"
                    description="This cannot be undone."
                    mutationOptions={{ mutationFn }}
                    mutateOptions={{}}
                    variables="user-1"
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))
            await user.click(
                screen.getByRole("button", { name: t("Shared.Confirm", undefined) }),
            )

            await waitFor(() => {
                expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
            })
        })

        it("stays open while the mutation is pending", async () => {
            const user = userEvent.setup()
            const resolvers: Array<() => void> = []
            const mutationFn = vi.fn<(variables: string) => Promise<void>>(
                () =>
                    new Promise<void>(resolve => {
                        resolvers.push(resolve)
                    }),
            )

            render(
                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="Deletion still pending"
                    trigger={trigger}
                    title="Delete user?"
                    description="This cannot be undone."
                    mutationOptions={{ mutationFn }}
                    mutateOptions={{}}
                    variables="user-1"
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))
            await user.click(
                screen.getByRole("button", { name: t("Shared.Confirm", undefined) }),
            )

            await waitFor(() => {
                expect(mutationFn).toHaveBeenCalledOnce()
            })
            expect(screen.getByRole("alertdialog")).toBeInTheDocument()

            resolvers[0]?.()

            await waitFor(() => {
                expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
            })
        })

        it("warns and stays open when the user tries to close it while pending", async () => {
            const user = userEvent.setup()
            const mutationFn = vi.fn<(variables: string) => Promise<void>>(
                () => new Promise<void>(noop),
            )

            render(
                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="Deletion still pending"
                    trigger={trigger}
                    title="Delete user?"
                    description="This cannot be undone."
                    mutationOptions={{ mutationFn }}
                    mutateOptions={{}}
                    variables="user-1"
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))
            await user.click(
                screen.getByRole("button", { name: t("Shared.Confirm", undefined) }),
            )

            await waitFor(() => {
                expect(mutationFn).toHaveBeenCalledOnce()
            })
            expect(
                screen.queryByText(t("Toast.Warning.Title", undefined)),
            ).not.toBeInTheDocument()

            await user.click(
                screen.getByRole("button", { name: t("Shared.Cancel", undefined) }),
            )

            expect(screen.getByRole("alertdialog")).toBeInTheDocument()
            expect(
                screen.getByText(t("Toast.Warning.Title", undefined)),
            ).toBeInTheDocument()
        })

        it("forwards the per-call mutateOptions onSuccess", async () => {
            const user = userEvent.setup()
            const onSuccess = vi.fn<() => void>()
            const mutationFn = vi
                .fn<(variables: string) => Promise<void>>()
                .mockResolvedValue(undefined)

            render(
                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="Deletion still pending"
                    trigger={trigger}
                    title="Delete user?"
                    description="This cannot be undone."
                    mutationOptions={{ mutationFn }}
                    mutateOptions={{ onSuccess }}
                    variables="user-1"
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))
            await user.click(
                screen.getByRole("button", { name: t("Shared.Confirm", undefined) }),
            )

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledOnce()
            })
        })

        it("gates the mutation behind enterToConfirm", async () => {
            const user = userEvent.setup()
            const mutationFn = vi
                .fn<(variables: string) => Promise<void>>()
                .mockResolvedValue(undefined)

            render(
                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="Deletion still pending"
                    trigger={trigger}
                    title="Delete user?"
                    description="This cannot be undone."
                    enterToConfirm="DELETE"
                    mutationOptions={{ mutationFn }}
                    mutateOptions={{}}
                    variables="user-1"
                />,
            )

            await user.click(screen.getByRole("button", { name: "Open" }))

            const confirmButton = screen.getByRole("button", {
                name: t("Shared.Confirm", undefined),
            })
            expect(confirmButton).toHaveAttribute("aria-disabled", "true")

            await user.click(confirmButton)
            expect(mutationFn).not.toHaveBeenCalled()

            await user.type(screen.getByPlaceholderText("DELETE"), "DELETE")
            expect(confirmButton).toHaveAttribute("aria-disabled", "false")

            await user.click(confirmButton)
            await waitFor(() => {
                expect(mutationFn).toHaveBeenCalledOnce()
            })
            expect(mutationFn).toHaveBeenCalledWith("user-1", expect.anything())
        })

        it("does not trigger the mutation when a standard dialog replaces it in the same tree position", async () => {
            const user = userEvent.setup()
            const mutationFn = vi
                .fn<(variables: string) => Promise<void>>()
                .mockResolvedValue(undefined)
            const onConfirm = vi.fn<() => void>()

            const SwitchHarness = () => {
                const [mode, setMode] = useState<"mutation" | "standard">("mutation")
                return (
                    <>
                        <Button
                            variant="secondary"
                            size="md"
                            type="button"
                            onClick={() => {
                                setMode("standard")
                            }}
                        >
                            Switch to standard
                        </Button>
                        {
                            // SAFETY: the conditional render IS the behaviour under
                            // test - we deliberately swap a mutation dialog for a
                            // standard one at the exact same tree position to prove
                            // confirm no longer triggers the mutation.
                            // oxlint-disable-next-line vitest/no-conditional-in-test
                            mode === "mutation" ? (
                                <AlertConfirmationDialog
                                    type="mutation"
                                    pendingWarning="Deletion still pending"
                                    trigger={trigger}
                                    title="Delete user?"
                                    description="This cannot be undone."
                                    mutationOptions={{ mutationFn }}
                                    mutateOptions={{}}
                                    variables="user-1"
                                />
                            ) : (
                                <AlertConfirmationDialog
                                    trigger={trigger}
                                    title="Delete user?"
                                    description="This cannot be undone."
                                    onConfirm={onConfirm}
                                />
                            )
                        }
                    </>
                )
            }

            render(<SwitchHarness />)

            await user.click(screen.getByRole("button", { name: "Switch to standard" }))

            await user.click(screen.getByRole("button", { name: "Open" }))
            await user.click(
                screen.getByRole("button", { name: t("Shared.Confirm", undefined) }),
            )

            expect(mutationFn).not.toHaveBeenCalled()
            expect(onConfirm).toHaveBeenCalledOnce()
        })
    })
})
