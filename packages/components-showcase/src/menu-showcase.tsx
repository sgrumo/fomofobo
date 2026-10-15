import { cn } from "frontend-shared/styles"
import { Button } from "ui-components/button"
import {
    MenuContent,
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuRoot,
    MenuSeparator,
    MenuTrigger,
} from "ui-components/menu"

interface MenuShowcaseProps {
    className?: string
}
export const MenuShowcase = (props: MenuShowcaseProps) => (
    <div className={cn("flex flex-col gap-6", props.className)}>
        <p className="tp-h4-semibold">Basic</p>
        <MenuBasicShowcase />
        <p className="tp-h4-semibold">With groups</p>
        <MenuGroupsShowcase />
        <p className="tp-h4-semibold">Destructive item</p>
        <MenuDestructiveShowcase />
    </div>
)

const MenuBasicShowcase = () => (
    <MenuRoot>
        <MenuTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open Menu
                </Button>
            }
            className="w-fit"
        />
        <MenuContent>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuItem>Help</MenuItem>
        </MenuContent>
    </MenuRoot>
)

const MenuGroupsShowcase = () => (
    <MenuRoot>
        <MenuTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open Menu
                </Button>
            }
            className="w-fit"
        />
        <MenuContent>
            <MenuGroup>
                <MenuGroupLabel>Account</MenuGroupLabel>
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuGroup>
                <MenuGroupLabel>Support</MenuGroupLabel>
                <MenuItem>Documentation</MenuItem>
                <MenuItem>Contact us</MenuItem>
            </MenuGroup>
        </MenuContent>
    </MenuRoot>
)

const MenuDestructiveShowcase = () => (
    <MenuRoot>
        <MenuTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open Menu
                </Button>
            }
            className="w-fit"
        />
        <MenuContent>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuSeparator />
            <MenuItem variant="destructive">Delete</MenuItem>
        </MenuContent>
    </MenuRoot>
)
