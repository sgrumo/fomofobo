import { capitalize, noop } from "es-toolkit"
import type { ReactNode } from "react"
import { useState } from "react"
import type { Time } from "shared/temporal"
import { timeFromString } from "shared/temporal"
import { Autocomplete } from "ui-components/autocomplete"
import { Checkbox, CheckboxGroup } from "ui-components/checkbox"
import type { CheckboxState } from "ui-components/checkbox"
import { Combobox } from "ui-components/combobox"
import { DateInput } from "ui-components/date-input"
import { DayPicker } from "ui-components/day-picker"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import {
    IconAlignCenter,
    IconAlignLeft,
    IconAlignRight,
    IconBold,
} from "ui-components/icons"
import { NumberInput } from "ui-components/number-input"
import { OtpInput } from "ui-components/otp-input"
import { PasswordInput } from "ui-components/password-input"
import { RadioGroup } from "ui-components/radio"
import { Select } from "ui-components/select"
import { Slider } from "ui-components/slider"
import { StringInput } from "ui-components/string-input"
import { Switch } from "ui-components/switch"
import { Textarea } from "ui-components/textarea"
import { TimeInput } from "ui-components/time-input"
import { ButtonToggle, ButtonToggleGroup } from "ui-components/toggle"
import { z } from "zod"

import type { Fruit } from "./components-showcase.helper"
import { fruitSchema, fruits } from "./components-showcase.helper"

const fruitNameSchema = z.enum(["apple", "banana", "cherry"])
type FruitName = z.infer<typeof fruitNameSchema>
const fruitNames: FruitName[] = ["apple", "banana", "cherry"]

const alignmentSchema = z.enum(["left", "center", "right"])
type Alignment = z.infer<typeof alignmentSchema>
const alignmentIcons: Record<Alignment, ReactNode> = {
    left: <IconAlignLeft />,
    center: <IconAlignCenter />,
    right: <IconAlignRight />,
}
const alignmentLabels: Record<Alignment, string> = {
    left: "Align left",
    center: "Align center",
    right: "Align right",
}

export const ViewModeShowcase = () => {
    const [viewMode, setViewMode] = useState(true)

    const [stringValue, setStringValue] = useState<string | undefined>("Granny Smith")
    const [urlValue, setUrlValue] = useState<string | undefined>("example")
    const [numberValue, setNumberValue] = useState<number | undefined>(42)
    const [passwordValue, setPasswordValue] = useState<string | undefined>("hunter2")
    const [otpValue, setOtpValue] = useState<string | undefined>("123456")
    const [textareaValue, setTextareaValue] = useState<string | undefined>(
        "The quick brown fox\njumps over the lazy dog.",
    )
    const [selectSingle, setSelectSingle] = useState<Fruit | undefined>(fruits[0])
    const [selectMultiple, setSelectMultiple] = useState<Fruit[]>(fruits.slice(0, 3))
    const [comboboxSingle, setComboboxSingle] = useState<Fruit | undefined>(fruits[1])
    const [comboboxMultiple, setComboboxMultiple] = useState<Fruit[]>(fruits.slice(0, 2))
    const [autocompleteValue, setAutocompleteValue] = useState<string | undefined>(
        fruits[0]?.label,
    )
    const [dateValue, setDateValue] = useState<Date | undefined>(() => new Date())
    const [timeValue, setTimeValue] = useState<Time | undefined>(timeFromString("09:30"))
    const [dayValue, setDayValue] = useState<Date>(() => new Date())
    const [checkboxValue, setCheckboxValue] = useState<CheckboxState>(true)
    const [checkboxGroupValue, setCheckboxGroupValue] = useState<FruitName[]>([
        "apple",
        "banana",
    ])
    const [radioValue, setRadioValue] = useState<FruitName | undefined>("banana")
    const [switchValue, setSwitchValue] = useState(true)
    const [togglePressed, setTogglePressed] = useState(true)
    const [toggleGroupValue, setToggleGroupValue] = useState<Alignment | undefined>(
        "center",
    )
    const [sliderValue, setSliderValue] = useState(40)

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <Field label="View mode" labelSide="right" required={false}>
                <Switch value={viewMode} onValueChange={setViewMode} />
            </Field>
            <Form
                mode={viewMode ? "view" : "edit"}
                onSubmit={noop}
                noValidate={false}
                className="grid w-full grid-cols-1 items-start gap-x-8 gap-y-6 lg:grid-cols-2"
            >
                <Field label="String Input" required={false}>
                    <StringInput
                        value={stringValue}
                        onValueChange={setStringValue}
                        className="w-full"
                    />
                </Field>
                <Field label="String Input (prefix & suffix)" required={false}>
                    <StringInput
                        value={urlValue}
                        onValueChange={setUrlValue}
                        prefix="www."
                        suffix=".com"
                        className="w-full"
                    />
                </Field>
                <Field label="Number Input" required={false}>
                    <NumberInput
                        value={numberValue}
                        onValueChange={setNumberValue}
                        size="md"
                        className="w-full"
                    />
                </Field>
                <Field label="Password Input" required={false}>
                    <PasswordInput
                        value={passwordValue}
                        onValueChange={setPasswordValue}
                        autoComplete="current-password"
                        size="md"
                        className="w-full"
                    />
                </Field>
                <Field label="Textarea" required={false}>
                    <Textarea
                        value={textareaValue}
                        onValueChange={setTextareaValue}
                        className="w-full"
                    />
                </Field>
                <Field label="OTP Input" required={false}>
                    <OtpInput
                        length={6}
                        value={otpValue}
                        onValueChange={setOtpValue}
                        size="md"
                    />
                </Field>
                <Field label="Date Input" required={false}>
                    <DateInput
                        mode="custom"
                        value={dateValue}
                        onValueChange={setDateValue}
                        className="w-full"
                    />
                </Field>
                <Field label="Time Input" required={false}>
                    <TimeInput
                        value={timeValue}
                        onValueChange={setTimeValue}
                        className="w-full"
                    />
                </Field>
                <Field label="Select (single)" required={false}>
                    <Select
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={selectSingle}
                        onValueChange={setSelectSingle}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Select (multiple)" required={false}>
                    <Select
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={selectMultiple}
                        onValueChange={setSelectMultiple}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Combobox (single)" required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={comboboxSingle}
                        onValueChange={setComboboxSingle}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Combobox (multiple)" required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={comboboxMultiple}
                        onValueChange={setComboboxMultiple}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Autocomplete" required={false}>
                    <Autocomplete
                        itemSchema={fruitSchema}
                        items={fruits}
                        value={autocompleteValue}
                        onValueChange={setAutocompleteValue}
                        getItemId={fruit => fruit.id}
                        getItemValue={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Slider" required={false}>
                    <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        size="md"
                        className="w-full"
                    />
                </Field>
                <Field
                    label="Checkbox"
                    labelSide="right"
                    className="self-end"
                    required={false}
                >
                    <Checkbox value={checkboxValue} onValueChange={setCheckboxValue} />
                </Field>
                <Field label="Switch" labelSide="right" required={false}>
                    <Switch value={switchValue} onValueChange={setSwitchValue} />
                </Field>
                <Field label="Toggle (button)" labelSide="right" required={false}>
                    <ButtonToggle
                        pressed={togglePressed}
                        onPressedChange={setTogglePressed}
                    >
                        <IconBold />
                    </ButtonToggle>
                </Field>
                <Field label="Checkbox Group" required={false}>
                    <CheckboxGroup
                        itemSchema={fruitNameSchema}
                        items={fruitNames}
                        getItemLabel={capitalize}
                        value={checkboxGroupValue}
                        onValueChange={setCheckboxGroupValue}
                    />
                </Field>
                <Field label="Radio Group" required={false}>
                    <RadioGroup
                        itemSchema={fruitNameSchema}
                        items={fruitNames}
                        getItemLabel={capitalize}
                        value={radioValue}
                        onValueChange={setRadioValue}
                        className="w-full"
                    />
                </Field>
                <Field label="Toggle Group" required={false}>
                    <ButtonToggleGroup
                        multiple={false}
                        itemSchema={alignmentSchema}
                        items={["left", "center", "right"]}
                        getItemIcon={item => alignmentIcons[item]}
                        getItemLabel={item => alignmentLabels[item]}
                        value={toggleGroupValue}
                        onValueChange={setToggleGroupValue}
                        className="w-fit"
                    />
                </Field>
                <Field label="Day Picker" required={false}>
                    <DayPicker value={dayValue} onValueChange={setDayValue} />
                </Field>
            </Form>
        </div>
    )
}
