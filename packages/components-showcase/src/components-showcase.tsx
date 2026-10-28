import { cn } from "frontend-shared/styles"
import type { ReactNode } from "react"

import { AccordionShowcase } from "./accordion-showcase"
import { AlertDialogShowcase } from "./alert-dialog-showcase"
import { AlertShowcase } from "./alert-showcase"
import { AutocompleteShowcase } from "./autocomplete-showcase"
import { AvatarShowcase } from "./avatar-showcase"
import { BadgeShowcase } from "./badge-showcase"
import { BottomSheetShowcase } from "./bottom-sheet-showcase"
import { ButtonShowcase } from "./button-showcase"
import { CheckboxShowcase } from "./checkbox-showcase"
import { ChipShowcase } from "./chip-showcase"
import { CollapsibleShowcase } from "./collapsible-showcase"
import { ColorsShowcase } from "./colors-showcase"
import { ComboboxShowcase } from "./combobox-showcase"
import type {
    ErrorBoundaryComponent,
    FormStateParser,
} from "./components-showcase.helper"
import { ContextMenuShowcase } from "./context-menu-showcase"
import { DateInputShowcase } from "./date-input-showcase"
import { DayPickerShowcase } from "./day-picker-showcase"
import { DialogShowcase } from "./dialog-showcase"
import { DrawerShowcase } from "./drawer-showcase"
import { ErrorBoundaryShowcase } from "./error-boundary-showcase"
import { FallbackBoxShowcase } from "./fallback-box-showcase"
import { FieldShowcase } from "./field-showcase"
import { FormErrorsShowcase } from "./form-errors-showcase"
import { IconButtonShowcase } from "./icon-button-showcase"
import { MenuShowcase } from "./menu-showcase"
import { MeterShowcase } from "./meter-showcase"
import { NumberInputShowcase } from "./number-input-showcase"
import { OtpInputShowcase } from "./otp-input-showcase"
import { PaginationShowcase } from "./pagination-showcase"
import { PasswordInputShowcase } from "./password-input-showcase"
import { PixelGlyphsShowcase } from "./pixel-glyphs-showcase"
import { PixelIconsShowcase } from "./pixel-icons-showcase"
import { PopoverShowcase } from "./popover-showcase"
import { ProgressShowcase } from "./progress-showcase"
import { RadioShowcase } from "./radio-showcase"
import { SearchFieldShowcase } from "./search-field-showcase"
import { SelectShowcase } from "./select-showcase"
import { SeparatorShowcase } from "./separator-showcase"
import { SliderShowcase } from "./slider-showcase"
import { SpinnerShowcase } from "./spinner-showcase"
import { StackingShowcase } from "./stacking-showcase"
import { StatGridShowcase } from "./stat-grid-showcase"
import { StepperShowcase } from "./stepper-showcase"
import { StringInputShowcase } from "./string-input-showcase"
import { SwitchShowcase } from "./switch-showcase"
import { TableShowcase } from "./table-showcase"
import { TabsShowcase } from "./tabs-showcase"
import { TextareaShowcase } from "./textarea-showcase"
import { TickProgressShowcase } from "./tick-progress-showcase"
import { TimeInputShowcase } from "./time-input-showcase"
import { TimelineShowcase } from "./timeline-showcase"
import { ToastShowcase } from "./toast-showcase"
import { ToggleShowcase } from "./toggle-showcase"
import { TooltipShowcase } from "./tooltip-showcase"
import { TypographyShowcase } from "./typography-showcase"
import { ViewModeShowcase } from "./view-mode-showcase"

interface ComponentsShowcaseProps {
    errorBoundary: ErrorBoundaryComponent
    parseFormState: FormStateParser
}

export const ComponentsShowcase = (props: ComponentsShowcaseProps) => (
    <div className="border-line grid grid-cols-1 items-center border-t-2 lg:grid-cols-2">
        <ShowcaseSection cols={2} title="Typography" component={<TypographyShowcase />} />
        <ShowcaseSection cols={2} title="Colors" component={<ColorsShowcase />} />
        <ShowcaseSection cols={1} title="Button" component={<ButtonShowcase />} />
        <ShowcaseSection cols={1} title="Badge" component={<BadgeShowcase />} />
        <ShowcaseSection cols={1} title="Chip" component={<ChipShowcase />} />
        <ShowcaseSection
            cols={1}
            title="Tick Progress"
            component={<TickProgressShowcase />}
        />
        <ShowcaseSection cols={1} title="Timeline" component={<TimelineShowcase />} />
        <ShowcaseSection
            cols={1}
            title="Icon Button"
            component={<IconButtonShowcase />}
        />
        <ShowcaseSection
            cols={1}
            title="Bottom Sheet"
            component={<BottomSheetShowcase />}
        />
        <ShowcaseSection cols={1} title="Stat Grid" component={<StatGridShowcase />} />
        <ShowcaseSection
            cols={1}
            title="Search Field"
            component={<SearchFieldShowcase />}
        />
        <ShowcaseSection
            cols={2}
            title="Pixel Icons"
            component={<PixelIconsShowcase />}
        />
        <ShowcaseSection
            cols={2}
            title="Pixel Glyphs"
            component={<PixelGlyphsShowcase />}
        />
        <ShowcaseSection
            cols={2}
            title="Field"
            component={<FieldShowcase className="w-full" />}
        />
        <ShowcaseSection
            cols={1}
            title="String Input"
            component={<StringInputShowcase className="w-full" />}
        />
        <ShowcaseSection
            cols={1}
            title="Number Input"
            component={<NumberInputShowcase className="w-full" />}
        />
        <ShowcaseSection
            cols={1}
            title="Password Input"
            component={<PasswordInputShowcase className="w-full" />}
        />
        <ShowcaseSection
            cols={1}
            title="OTP Input"
            component={<OtpInputShowcase className="w-full" />}
        />
        <ShowcaseSection
            cols={2}
            title="Textarea"
            component={<TextareaShowcase className="w-full" />}
        />
        <ShowcaseSection
            cols={2}
            title="Form Errors"
            component={<FormErrorsShowcase parseFormState={props.parseFormState} />}
        />
        <ShowcaseSection cols={2} title="Select" component={<SelectShowcase />} />
        <ShowcaseSection cols={2} title="Combobox" component={<ComboboxShowcase />} />
        <ShowcaseSection
            cols={1}
            title="Autocomplete"
            component={<AutocompleteShowcase />}
        />
        <ShowcaseSection cols={1} title="Date Input" component={<DateInputShowcase />} />
        <ShowcaseSection cols={1} title="Time Input" component={<TimeInputShowcase />} />
        <ShowcaseSection cols={1} title="Day Picker" component={<DayPickerShowcase />} />
        <ShowcaseSection cols={1} title="Checkbox" component={<CheckboxShowcase />} />
        <ShowcaseSection cols={1} title="Radio" component={<RadioShowcase />} />
        <ShowcaseSection cols={1} title="Switch" component={<SwitchShowcase />} />
        <ShowcaseSection cols={1} title="Toggle" component={<ToggleShowcase />} />
        <ShowcaseSection cols={1} title="Slider" component={<SliderShowcase />} />
        <ShowcaseSection cols={1} title="Pagination" component={<PaginationShowcase />} />
        <ShowcaseSection cols={2} title="View Mode" component={<ViewModeShowcase />} />
        <ShowcaseSection
            cols={1}
            title="Toasts"
            component={<ToastShowcase className="w-full" />}
        />
        <ShowcaseSection cols={1} title="Dialog" component={<DialogShowcase />} />
        <ShowcaseSection
            cols={1}
            title="Alert Dialog"
            component={<AlertDialogShowcase />}
        />
        <ShowcaseSection cols={1} title="Drawer" component={<DrawerShowcase />} />
        <ShowcaseSection
            cols={2}
            title="Table"
            component={<TableShowcase className="w-full" />}
        />
        <ShowcaseSection cols={1} title="Accordion" component={<AccordionShowcase />} />
        <ShowcaseSection cols={1} title="Spinner" component={<SpinnerShowcase />} />
        <ShowcaseSection cols={1} title="Alert" component={<AlertShowcase />} />
        <ShowcaseSection cols={1} title="Tabs" component={<TabsShowcase />} />
        <ShowcaseSection
            cols={2}
            title="Stepper"
            component={<StepperShowcase className="max-w-[40rem]" />}
        />
        <ShowcaseSection cols={1} title="Tooltip" component={<TooltipShowcase />} />
        <ShowcaseSection cols={1} title="Popover" component={<PopoverShowcase />} />
        <ShowcaseSection cols={1} title="Menu" component={<MenuShowcase />} />
        <ShowcaseSection cols={1} title="Avatar" component={<AvatarShowcase />} />
        <ShowcaseSection
            cols={1}
            title="Collapsible"
            component={<CollapsibleShowcase />}
        />
        <ShowcaseSection
            cols={1}
            title="Fallback Box"
            component={<FallbackBoxShowcase />}
        />
        <ShowcaseSection cols={1} title="Meter" component={<MeterShowcase />} />
        <ShowcaseSection cols={1} title="Progress" component={<ProgressShowcase />} />
        <ShowcaseSection
            cols={1}
            title="Context Menu"
            component={<ContextMenuShowcase />}
        />
        <ShowcaseSection cols={1} title="Separator" component={<SeparatorShowcase />} />
        <ShowcaseSection
            cols={1}
            title="Error Boundary"
            component={<ErrorBoundaryShowcase errorBoundary={props.errorBoundary} />}
        />
        <ShowcaseSection
            cols={1}
            title="Stacking / Z-Index"
            component={<StackingShowcase />}
        />
    </div>
)

interface ShowcaseSectionProps {
    cols: 1 | 2
    title: string
    component: ReactNode
}
const ShowcaseSection = (props: ShowcaseSectionProps) => (
    <div
        className={cn(
            "border-line flex h-full min-h-[50dvh] flex-col gap-4 border-x border-b-2 p-4",
            { "lg:col-span-2": props.cols === 2 },
        )}
    >
        <span className="tp-pixel-2xl w-full p-1 text-center">{props.title}</span>
        <div className="flex w-full grow flex-col items-center justify-center">
            {props.component}
        </div>
    </div>
)
