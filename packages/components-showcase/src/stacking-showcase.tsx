import { cn } from "frontend-shared/styles"
import { useState } from "react"
import type { ReactNode } from "react"
import { Autocomplete } from "ui-components/autocomplete"
import {
    BottomSheetContent,
    BottomSheetRoot,
    BottomSheetTitle,
    BottomSheetTrigger,
} from "ui-components/bottom-sheet"
import { Button } from "ui-components/button"
import { Combobox } from "ui-components/combobox"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "ui-components/context-menu"
import { DateInput } from "ui-components/date-input"
import {
    DialogBody,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "ui-components/dialog"
import {
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerRoot,
    DrawerTitle,
    DrawerTrigger,
} from "ui-components/drawer"
import { Field } from "ui-components/field"
import {
    MenuContent,
    MenuItem,
    MenuRoot,
    MenuSeparator,
    MenuTrigger,
} from "ui-components/menu"
import {
    PopoverContent,
    PopoverDescription,
    PopoverRoot,
    PopoverTitle,
    PopoverTrigger,
} from "ui-components/popover"
import { Select } from "ui-components/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "ui-components/table"
import { useToast } from "ui-components/toast"

import type { Fruit } from "./components-showcase.helper"
import { fruitSchema, fruits } from "./components-showcase.helper"

const dialogContentClassName = "max-w-[calc(min(40rem_,90dvw))]"

interface ShowToastButtonProps {
    label: string
}
const ShowToastButton = (props: ShowToastButtonProps) => {
    const toast = useToast()
    return (
        <Button
            variant="secondary"
            size="md"
            type="button"
            className="w-fit"
            onClick={() => {
                toast.add({
                    type: "info",
                    title: props.label,
                    messages: [
                        "This toast must cover every overlay (dialogs, drawers) and the sticky table header.",
                    ],
                })
            }}
        >
            {props.label}
        </Button>
    )
}

const InlineFruitSelect = () => {
    const [value, setValue] = useState<Fruit | undefined>(undefined)
    return (
        <Select
            multiple={false}
            resettable={true}
            items={fruits}
            value={value}
            onValueChange={setValue}
            getItemId={fruit => fruit.id}
            renderItem={({ item }) => <span>{item.label}</span>}
            className="w-full"
        />
    )
}

const FruitSelect = () => (
    <Field label="Select" required={false}>
        <InlineFruitSelect />
    </Field>
)

const FruitAutocomplete = () => {
    const [value, setValue] = useState<string | undefined>(undefined)
    return (
        <Field label="Autocomplete" required={false}>
            <Autocomplete
                itemSchema={fruitSchema}
                items={fruits}
                value={value}
                onValueChange={setValue}
                getItemId={fruit => fruit.id}
                getItemValue={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
                className="w-full"
            />
        </Field>
    )
}

const FruitCombobox = () => {
    const [value, setValue] = useState<Fruit | undefined>(undefined)
    return (
        <Field label="Combobox" required={false}>
            <Combobox
                type="standard"
                async={false}
                multiple={false}
                resettable={true}
                items={fruits}
                value={value}
                onValueChange={setValue}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
                className="w-full"
            />
        </Field>
    )
}

const SampleDateInput = () => {
    const [value, setValue] = useState<Date | undefined>(undefined)
    return (
        <Field label="Date picker" required={false}>
            <DateInput
                mode="custom"
                value={value}
                onValueChange={setValue}
                className="w-full"
            />
        </Field>
    )
}

const SampleMenu = () => (
    <MenuRoot>
        <MenuTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open menu
                </Button>
            }
            className="w-fit"
        />
        <MenuContent>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuSeparator />
            <MenuItem variant="destructive">Delete</MenuItem>
        </MenuContent>
    </MenuRoot>
)

const SamplePopover = () => (
    <PopoverRoot>
        <PopoverTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open popover
                </Button>
            }
        />
        <PopoverContent showArrow={true}>
            <PopoverTitle>Popover</PopoverTitle>
            <PopoverDescription>Should sit above its container.</PopoverDescription>
        </PopoverContent>
    </PopoverRoot>
)

const SampleContextMenu = () => (
    <ContextMenu>
        <ContextMenuTrigger className="tp-body-md border-line-muted text-fg-muted flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed">
            Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent>
            <ContextMenuItem>Cut</ContextMenuItem>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuContent>
    </ContextMenu>
)

interface OverlayContainerProps {
    triggerLabel: string
    title: string
    children: ReactNode
}

const OverlayDialog = (props: OverlayContainerProps) => (
    <DialogRoot>
        <DialogTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    {props.triggerLabel}
                </Button>
            }
        />
        <DialogContent className={dialogContentClassName}>
            <DialogHeader>
                <DialogTitle>{props.title}</DialogTitle>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-4">{props.children}</DialogBody>
            <DialogFooter className="flex justify-end">
                <DialogClose
                    render={
                        <Button variant="secondary" size="md" type="button">
                            Close
                        </Button>
                    }
                />
            </DialogFooter>
        </DialogContent>
    </DialogRoot>
)

const OverlayDrawer = (props: OverlayContainerProps) => (
    <DrawerRoot side="right">
        <DrawerTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    {props.triggerLabel}
                </Button>
            }
        />
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>{props.title}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-4">{props.children}</DrawerBody>
        </DrawerContent>
    </DrawerRoot>
)

const OverlayBottomSheet = (props: OverlayContainerProps) => (
    <BottomSheetRoot>
        <BottomSheetTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    {props.triggerLabel}
                </Button>
            }
        />
        <BottomSheetContent>
            <BottomSheetTitle>{props.title}</BottomSheetTitle>
            {props.children}
        </BottomSheetContent>
    </BottomSheetRoot>
)

interface OverlayKitProps {
    nested: boolean
}
const OverlayKit = (props: OverlayKitProps) => (
    <>
        <FruitSelect />
        <FruitAutocomplete />
        <FruitCombobox />
        <SampleDateInput />
        <div className="flex flex-wrap items-center gap-3">
            <SampleMenu />
            <SamplePopover />
            <ShowToastButton label="Show toast" />
        </div>
        <SampleContextMenu />
        {props.nested && (
            <div className="flex flex-wrap items-center gap-3">
                <OverlayDialog triggerLabel="Open nested dialog" title="Nested dialog">
                    <OverlayKit nested={false} />
                </OverlayDialog>
                <OverlayDrawer triggerLabel="Open nested drawer" title="Nested drawer">
                    <OverlayKit nested={false} />
                </OverlayDrawer>
            </div>
        )}
    </>
)

const StickyTableWithOverlays = () => (
    <div className="flex w-full flex-col gap-3">
        <div className="max-h-[18rem] w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[34%]">Fruit</TableHead>
                        <TableHead className="w-[36%]">Select</TableHead>
                        <TableHead className="w-[30%]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody showEmptyFallback={false}>
                    {fruits.map(fruit => (
                        <TableRow key={fruit.id}>
                            <TableCell>{fruit.label}</TableCell>
                            <TableCell ellipsis={false}>
                                <InlineFruitSelect />
                            </TableCell>
                            <TableCell ellipsis={false}>
                                <SampleMenu />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
)

interface StackingSectionShowcaseProps {
    title: string
    children: ReactNode
}
const StackingSectionShowcase = (props: StackingSectionShowcaseProps) => (
    <div className="flex w-full flex-col gap-3">
        <p className="tp-pixel-lg">{props.title}</p>
        <div className="flex flex-wrap items-start gap-3">{props.children}</div>
    </div>
)

interface StackingShowcaseProps {
    className?: string
}
export const StackingShowcase = (props: StackingShowcaseProps) => (
    <div className={cn("flex w-full flex-col gap-8", props.className)}>
        <ShowToastButton label="Toast over page" />

        <StackingSectionShowcase title="Dialog">
            <OverlayDialog triggerLabel="Open dialog" title="Dialog">
                <OverlayKit nested={true} />
            </OverlayDialog>
        </StackingSectionShowcase>

        <StackingSectionShowcase title="Drawer">
            <OverlayDrawer triggerLabel="Open drawer" title="Drawer">
                <OverlayKit nested={true} />
            </OverlayDrawer>
        </StackingSectionShowcase>

        <StackingSectionShowcase title="Bottom sheet">
            <OverlayBottomSheet triggerLabel="Open bottom sheet" title="Bottom sheet">
                <OverlayKit nested={false} />
            </OverlayBottomSheet>
        </StackingSectionShowcase>

        <StackingSectionShowcase title="Sticky table header">
            <StickyTableWithOverlays />
        </StackingSectionShowcase>
    </div>
)
