"use client"

import { useTranslation } from "react-i18next"
import { Avatar } from "ui-components/avatar"
import {
    MenuContent,
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuRoot,
    MenuSeparator,
    MenuTrigger,
} from "ui-components/menu"

import { routeHandlers } from "@/framework/routes/routes"

interface SessionMenuProps {
    /** Name of the signed-in account. */
    name: string
}

/**
 * @description Returns the initials of a display name, two letters at most
 * @param name Display name of the visitor
 */
const initialsOf = (name: string): string =>
    name
        .split(/\s+/u)
        .filter(part => part.length > 0)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("")

export const SessionMenu = (props: SessionMenuProps) => {
    const { t } = useTranslation("shared")

    return (
        <MenuRoot>
            <MenuTrigger
                aria-label={t("Session.Menu")}
                className="focus-visible:outline-focus rounded-full focus-visible:outline-2 focus-visible:outline-offset-1"
            >
                <Avatar
                    size="sm"
                    src={undefined}
                    fullName={props.name}
                    fallback={initialsOf(props.name)}
                />
            </MenuTrigger>
            <MenuContent positionerProps={{ align: "end" }}>
                <MenuGroup>
                    <MenuGroupLabel>
                        {t("Session.SignedInAs", { name: props.name })}
                    </MenuGroupLabel>
                </MenuGroup>
                <MenuSeparator />
                {/*
                    A form, not a fetch: the logout route answers `POST` only, and a form
                    needs no JavaScript to send one.
                */}
                <form
                    action={routeHandlers.authLogout.path({ parameters: {} })}
                    method="post"
                >
                    <MenuItem
                        variant="destructive"
                        nativeButton={true}
                        render={<button type="submit">{t("Session.SignOut")}</button>}
                        className="w-full"
                    />
                </form>
            </MenuContent>
        </MenuRoot>
    )
}
