import { Avatar } from "ui-components/avatar"

const onePixelPng =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

export const AvatarSamples = () => (
    <div className="flex items-center gap-4">
        <Avatar src={onePixelPng} fullName="Grace Hopper" fallback="GH" />
        <Avatar src={undefined} fullName="Ada Lovelace" fallback="AL" />
    </div>
)
