import type { ReactNode } from "react"

import { AccordionSamples } from "./accordion-samples"
import { AlertDialogSamples } from "./alert-dialog-samples"
import { AlertSamples } from "./alert-samples"
import { AutocompleteSamples } from "./autocomplete-samples"
import { AvatarSamples } from "./avatar-samples"
import { ButtonSamples } from "./button-samples"
import { CheckboxSamples } from "./checkbox-samples"
import { CollapsibleSamples } from "./collapsible-samples"
import { ComboboxSamples } from "./combobox-samples"
import { ContextMenuSamples } from "./context-menu-samples"
import { DateInputSamples } from "./date-input-samples"
import { DayPickerSamples } from "./day-picker-samples"
import { DialogSamples } from "./dialog-samples"
import { DrawerSamples } from "./drawer-samples"
import { FallbackBoxSamples } from "./fallback-box-samples"
import { FormSamples } from "./form-samples"
import { InputSamples } from "./input-samples"
import { MenuSamples } from "./menu-samples"
import { MeterSamples } from "./meter-samples"
import { OtpInputSamples } from "./otp-input-samples"
import { PaginationSamples } from "./pagination-samples"
import { PopoverSamples } from "./popover-samples"
import { ProgressSamples } from "./progress-samples"
import { RadioSamples } from "./radio-samples"
import { SelectSamples } from "./select-samples"
import { SeparatorSamples } from "./separator-samples"
import { SliderSamples } from "./slider-samples"
import { SpinnerSamples } from "./spinner-samples"
import { StepperSamples } from "./stepper-samples"
import { SwitchSamples } from "./switch-samples"
import { TableSamples } from "./table-samples"
import { TabsSamples } from "./tabs-samples"
import { ToastSamples } from "./toast-samples"
import { ToggleSamples } from "./toggle-samples"
import { TooltipSamples } from "./tooltip-samples"

export const ComponentsSamples = () => (
    <div className="flex flex-col">
        <SamplesSection title="Accordion Samples">
            <AccordionSamples />
        </SamplesSection>
        <SamplesSection title="Alert Samples">
            <AlertSamples />
        </SamplesSection>
        <SamplesSection title="Alert Dialog Samples">
            <AlertDialogSamples />
        </SamplesSection>
        <SamplesSection title="Autocomplete Samples">
            <AutocompleteSamples />
        </SamplesSection>
        <SamplesSection title="Button Samples">
            <ButtonSamples />
        </SamplesSection>
        <SamplesSection title="Checkbox Samples">
            <CheckboxSamples />
        </SamplesSection>
        <SamplesSection title="Collapsible Samples">
            <CollapsibleSamples />
        </SamplesSection>
        <SamplesSection title="Combobox Samples">
            <ComboboxSamples />
        </SamplesSection>
        <SamplesSection title="Context Menu Samples">
            <ContextMenuSamples />
        </SamplesSection>
        <SamplesSection title="Date Input Samples">
            <DateInputSamples />
        </SamplesSection>
        <SamplesSection title="Day Picker Samples">
            <DayPickerSamples />
        </SamplesSection>
        <SamplesSection title="Dialog Samples">
            <DialogSamples />
        </SamplesSection>
        <SamplesSection title="Drawer Samples">
            <DrawerSamples />
        </SamplesSection>
        <SamplesSection title="Form Samples">
            <FormSamples />
        </SamplesSection>
        <SamplesSection title="Input Samples">
            <InputSamples />
        </SamplesSection>
        <SamplesSection title="Menu Samples">
            <MenuSamples />
        </SamplesSection>
        <SamplesSection title="Meter Samples">
            <MeterSamples />
        </SamplesSection>
        <SamplesSection title="OTP Input Samples">
            <OtpInputSamples />
        </SamplesSection>
        <SamplesSection title="Progress Samples">
            <ProgressSamples />
        </SamplesSection>
        <SamplesSection title="Pagination Samples">
            <PaginationSamples />
        </SamplesSection>
        <SamplesSection title="Popover Samples">
            <PopoverSamples />
        </SamplesSection>
        <SamplesSection title="Radio Samples">
            <RadioSamples />
        </SamplesSection>
        <SamplesSection title="Select Samples">
            <SelectSamples />
        </SamplesSection>
        <SamplesSection title="Separator Samples">
            <SeparatorSamples />
        </SamplesSection>
        <SamplesSection title="Slider Samples">
            <SliderSamples />
        </SamplesSection>
        <SamplesSection title="Spinner Samples">
            <SpinnerSamples />
        </SamplesSection>
        <SamplesSection title="Stepper Samples">
            <StepperSamples />
        </SamplesSection>
        <SamplesSection title="Switch Samples">
            <SwitchSamples />
        </SamplesSection>
        <SamplesSection title="Table Samples">
            <TableSamples />
        </SamplesSection>
        <SamplesSection title="Tabs Samples">
            <TabsSamples />
        </SamplesSection>
        <SamplesSection title="Toast Samples">
            <ToastSamples />
        </SamplesSection>
        <SamplesSection title="Toggle Samples">
            <ToggleSamples />
        </SamplesSection>
        <SamplesSection title="Tooltip Samples">
            <TooltipSamples />
        </SamplesSection>
        <SamplesSection title="Avatar Samples">
            <AvatarSamples />
        </SamplesSection>
        <SamplesSection title="Fallback Box Samples">
            <FallbackBoxSamples />
        </SamplesSection>
    </div>
)

interface SamplesSectionProps {
    title: string
    children: ReactNode
}
const SamplesSection = (props: SamplesSectionProps) => (
    <section
        aria-label={props.title}
        className="border-line flex flex-col gap-4 border-b p-4"
    >
        <h2 className="tp-pixel-2xl">{props.title}</h2>
        <div className="flex flex-col gap-4">{props.children}</div>
    </section>
)
