import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope } from "./shared"
import { pageOf } from "./shared"

/**
 * @description Returns the 1-based positions of a slot count
 * @param length Slot count
 */
const slotPositions = (length: number): number[] =>
    Array.from({ length }, (_, index) => index + 1)

/**
 * @description Returns the group element that wraps the OTP slots
 * @param scope Search root
 * @param label Accessible label
 */
export const getOtpInputGroup = (scope: Scope, label: string) =>
    scope.getByRole("group", { name: label, exact: true })

/**
 * @description Returns every slot input of the OTP input, in order
 * @param scope Search root
 * @param label Accessible label
 */
export const getOtpInputSlots = (scope: Scope, label: string) =>
    getOtpInputGroup(scope, label).locator("input")

/**
 * @description Returns the input of one OTP slot
 * @param scope Search root
 * @param label Accessible label
 * @param position 1-based slot position
 * @remarks Matches the name of a slot: its position joined with the field label
 */
export const getOtpInputSlot = (scope: Scope, label: string, position: number) =>
    getOtpInputGroup(scope, label).getByRole("textbox", {
        name: `${t("ui", "OtpInput.Slot", { position })} ${label}`,
        exact: true,
    })

/**
 * @description Asserts the OTP input holds the expected slot count
 * @param scope Search root
 * @param label Accessible label
 * @param length Expected slot count
 * @throws When the OTP input holds another slot count
 */
const expectOtpInputSlotCount = async (scope: Scope, label: string, length: number) => {
    await expect(
        getOtpInputSlots(scope, label),
        `"${label}" needs ${String(length)} slots, one per value character`,
    ).toHaveCount(length)
}

/**
 * @description Types the value into the OTP input, one character per slot
 * @param scope Search root
 * @param label Accessible label
 * @param value Value to enter
 * @throws When the value holds a character count other than the slot count
 */
export const fillOtpInput = async (scope: Scope, label: string, value: string) => {
    await expectOtpInputSlotCount(scope, label, value.length)

    // Typed on the keyboard rather than filled: the focus moves to the next slot
    // after every character, so one `fill` would land the whole value in slot one
    await getOtpInputSlot(scope, label, 1).click()
    await pageOf(scope).keyboard.type(value)
    await expectOtpInputValue(scope, label, value)
}

/**
 * @description Clears every slot of the OTP input
 * @param scope Search root
 * @param label Accessible label
 * @param length Slot count
 */
export const clearOtpInput = async (scope: Scope, label: string, length: number) => {
    const firstSlot = getOtpInputSlot(scope, label, 1)
    await firstSlot.click()
    await firstSlot.press("ControlOrMeta+Backspace")
    await expectOtpInputEmpty(scope, label, length)
}

/**
 * @description Asserts the value of every OTP slot, in order
 * @param scope Search root
 * @param label Accessible label
 * @param value Expected value
 * @throws When the value holds a character count other than the slot count
 */
export const expectOtpInputValue = async (scope: Scope, label: string, value: string) => {
    await expectOtpInputSlotCount(scope, label, value.length)

    for (const position of slotPositions(value.length)) {
        await expect(getOtpInputSlot(scope, label, position)).toHaveValue(
            value.charAt(position - 1),
        )
    }
}

/**
 * @description Asserts every OTP slot is empty
 * @param scope Search root
 * @param label Accessible label
 * @param length Slot count
 */
export const expectOtpInputEmpty = async (
    scope: Scope,
    label: string,
    length: number,
) => {
    for (const position of slotPositions(length)) {
        await expect(getOtpInputSlot(scope, label, position)).toHaveValue("")
    }
}

/**
 * @description Asserts the OTP slots are masked (`type="password"`)
 * @param scope Search root
 * @param label Accessible label
 */
export const expectOtpInputMasked = async (scope: Scope, label: string) => {
    await expect(getOtpInputSlot(scope, label, 1)).toHaveAttribute("type", "password")
}

/**
 * @description Asserts the OTP slots reject input
 * @param scope Search root
 * @param label Accessible label
 * @param length Slot count
 */
export const expectOtpInputDisabled = async (
    scope: Scope,
    label: string,
    length: number,
) => {
    for (const position of slotPositions(length)) {
        await expect(getOtpInputSlot(scope, label, position)).toBeDisabled()
    }
}
