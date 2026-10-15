import { cn } from "frontend-shared/styles"
import { Avatar } from "ui-components/avatar"

const avatarSrc =
    "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"

interface AvatarShowcaseProps {
    className?: string
}
export const AvatarShowcase = (props: AvatarShowcaseProps) => (
    <div className={cn("flex flex-col gap-6", props.className)}>
        <p className="tp-h4-semibold">With image</p>
        <div className="flex items-center gap-4">
            <Avatar size="sm" src={avatarSrc} fullName="Lisa Turner" fallback="LT" />
            <Avatar size="md" src={avatarSrc} fullName="Lisa Turner" fallback="LT" />
            <Avatar size="lg" src={avatarSrc} fullName="Lisa Turner" fallback="LT" />
        </div>
        <p className="tp-h4-semibold">Fallback (initials)</p>
        <div className="flex items-center gap-4">
            <Avatar size="sm" src={undefined} fullName="User" fallback="AB" />
            <Avatar size="md" src={undefined} fullName="User" fallback="CD" />
            <Avatar size="lg" src={undefined} fullName="User" fallback="EF" />
        </div>
    </div>
)
