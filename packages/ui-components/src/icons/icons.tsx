import type { ComponentProps } from "react"
import { useId } from "react"
import type { StrictOmit } from "shared/types"

export const IconAlignCenter = ({ strokeWidth = 2, ...props }: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            d="M3 6h18M6 10h12M3 14h18M6 18h12"
        />
    </svg>
)

export const IconAlignLeft = ({ strokeWidth = 2, ...props }: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            d="M3 6h18M3 10h12M3 14h18M3 18h12"
        />
    </svg>
)

export const IconAlignRight = ({ strokeWidth = 2, ...props }: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            d="M3 6h18M9 10h12M3 14h18M9 18h12"
        />
    </svg>
)

export const IconBold = (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            fill="currentColor"
            d="M8 11h4.5a2.5 2.5 0 0 0 0-5H8v5Zm0 2v5h5a2.5 2.5 0 0 0 0-5H8ZM6 4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.5 4.5 0 0 1 13 20H6V4Z"
        />
    </svg>
)

export const IconBulletList = (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            fill="currentColor"
            d="M8 4h13v2H8V4ZM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM8 11h13v2H8v-2Zm0 7h13v2H8v-2Z"
        />
    </svg>
)

export const IconCalendar = (props: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
        <path
            fill="currentColor"
            d="M7.5.833V2.5h5V.833h1.667V2.5H17.5c.46 0 .833.373.833.833v13.334c0 .46-.373.833-.833.833h-15a.833.833 0 0 1-.833-.833V3.333c0-.46.373-.833.833-.833h3.333V.833H7.5Zm9.167 8.334H3.333v6.666h13.334V9.167Zm-10 1.666V12.5H5v-1.667h1.667Zm4.166 0V12.5H9.167v-1.667h1.666Zm4.167 0V12.5h-1.667v-1.667H15ZM5.833 4.167h-2.5V7.5h13.334V4.167h-2.5v1.666H12.5V4.167h-5v1.666H5.833V4.167Z"
        />
    </svg>
)

export const IconCheckCircle = ({
    strokeWidth = 1.5,
    ...props
}: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="m7 12.5 3 3 7-7"
        />
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
        />
    </svg>
)

export const IconCheck = (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            fill="currentColor"
            d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"
        />
    </svg>
)

export const IconChevronDown = (props: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
        <path
            fill="currentColor"
            d="m10 10.976 4.125-4.125 1.178 1.179L10 13.333 4.696 8.03 5.875 6.85 10 10.976Z"
        />
    </svg>
)

export const IconChevronRight = (props: ComponentProps<"svg">) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
            fill="currentColor"
            d="m13.171 12-4.95-4.95 1.415-1.413L16 12l-6.364 6.364-1.414-1.415 4.95-4.95Z"
        />
    </svg>
)

export const IconCircleMinus = (props: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" fill="none">
        <path
            fill="currentColor"
            d="M8.333 16.667A8.333 8.333 0 1 1 8.333 0a8.333 8.333 0 0 1 0 16.667Zm0-1.667a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333ZM4.167 7.5H12.5v1.667H4.167V7.5Z"
        />
    </svg>
)

export const IconCirclePlus = (props: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" fill="none">
        <path
            fill="currentColor"
            d="M7.5 7.5V4.167h1.667V7.5H12.5v1.667H9.167V12.5H7.5V9.167H4.167V7.5H7.5Zm.833 9.167A8.333 8.333 0 1 1 8.333 0a8.333 8.333 0 0 1 0 16.667Zm0-1.667a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333Z"
        />
    </svg>
)

export const IconCopy = (props: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 22">
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M6.558 4.603c-.734.099-1.122.28-1.398.556-.277.276-.458.665-.557 1.4-.101.755-.103 1.756-.103 3.191v5c0 1.435.002 2.436.103 3.192.099.734.28 1.122.556 1.398.276.277.665.458 1.4.557.755.101 1.756.103 3.191.103h3c1.435 0 2.436-.002 3.192-.103.734-.099 1.122-.28 1.398-.556.277-.276.458-.665.557-1.4.101-.755.103-1.756.103-3.191v-5c0-1.435-.002-2.436-.103-3.192-.099-.734-.28-1.122-.556-1.398-.276-.277-.665-.458-1.4-.557-.755-.101-1.756-.103-3.191-.103h-3c-1.435 0-2.436.002-3.192.103ZM9.695 3h3.11c1.367 0 2.47 0 3.337.117.9.12 1.658.38 2.26.982.601.601.86 1.36.981 2.26.117.866.117 1.969.117 3.336v5.11c0 1.367 0 2.47-.117 3.337-.12.9-.38 1.658-.982 2.26-.602.602-1.36.86-2.26.981-.866.117-1.969.117-3.336.117h-3.11c-1.367 0-2.47 0-3.337-.117-.9-.12-1.657-.38-2.259-.981-.602-.602-.861-1.36-.982-2.26C3 17.275 3 16.172 3 14.805v-5.11c0-1.367 0-2.47.117-3.337.12-.9.38-1.658.982-2.26.601-.601 1.36-.86 2.26-.981C7.224 3 8.327 3 9.694 3Z"
            clipRule="evenodd"
        />
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M4.461 1.64c-1.005.136-1.585.39-2.009.813-.423.422-.677 1.002-.812 2.008-.138 1.028-.14 2.382-.14 4.289v6A2.25 2.25 0 0 0 3.75 17v1.5A3.75 3.75 0 0 1 0 14.75V8.694C0 6.856 0 5.4.153 4.26c.158-1.172.49-2.121 1.239-2.87C2.14.644 3.089.311 4.262.154 5.401 0 6.86 0 8.701 0h4.048a3.75 3.75 0 0 1 3.75 3.75H15a2.25 2.25 0 0 0-2.25-2.25h-4c-1.907 0-3.261.002-4.289.14Z"
            clipRule="evenodd"
        />
    </svg>
)

export const IconEyeClosed = ({ strokeWidth = 1.5, ...props }: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="m19.5 16-2.475-3.396M12 17.5V14M4.5 16l2.469-3.388M3 8c3.6 8 14.4 8 18 0"
        />
    </svg>
)

export const IconEye = ({ strokeWidth = 1.5, ...props }: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M3 13c3.6-8 14.4-8 18 0"
        />
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M12 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
        />
    </svg>
)

export const IconHome = ({ strokeWidth = 1.5, ...props }: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M2.25 12 11.204 3.045a1.125 1.125 0 0 1 1.591 0L21.75 12M4.5 9.75v9.75a.75.75 0 0 0 .75.75H9.75v-6h4.5v6h4.5a.75.75 0 0 0 .75-.75V9.75"
        />
    </svg>
)

export const IconHorizontalLine = (props: ComponentProps<"svg">) => (
    <svg viewBox="0 0 16 16" fill="none" {...props}>
        <path fill="currentColor" d="M3.333 7.333v1.334h9.334V7.333H3.333Z" />
    </svg>
)

export const IconInfo = ({ strokeWidth = 1.5, ...props }: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M12 11.5v5M12 7.51l.01-.011M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
        />
    </svg>
)

export const IconItalic = (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            fill="currentColor"
            d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15v2Z"
        />
    </svg>
)

export const IconLink = (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            fill="currentColor"
            d="M18.364 15.536 16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414Zm-2.828 2.828-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414Zm-.708-10.607 1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07Z"
        />
    </svg>
)

export const IconMonitor = ({ strokeWidth = 1.5, ...props }: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m-6 0h6m-6 0H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25V15a2.25 2.25 0 0 1-2.25 2.25H15"
        />
    </svg>
)

export const IconMoon = ({ strokeWidth = 1.5, ...props }: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
        />
    </svg>
)

export const IconPlus = ({ strokeWidth = 1.25, ...props }: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M1 6h5m5 0H6m0 0V1m0 5v5"
        />
    </svg>
)

interface IconSpinnerProps extends StrictOmit<
    ComponentProps<"svg">,
    "aria-label" | "aria-labelledby"
> {
    title?: string
}
export const IconSpinner = ({ strokeWidth = 2, ...props }: IconSpinnerProps) => {
    const titleId = useId()
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            viewBox="0 0 24 24"
            aria-labelledby={props.title ? titleId : undefined}
            aria-label={props.title}
            {...props}
        >
            {props.title && <title id={titleId}>{props.title}</title>}
            <path d="M12 6V3M16.25 7.75 18.4 5.6M18 12h3M16.25 16.25l2.15 2.15M12 18v3M7.75 16.25 5.6 18.4M6 12H3M7.75 7.75 5.6 5.6" />
        </svg>
    )
}

export const IconStop = (props: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 74 74" fill="none">
        <path
            fill="currentColor"
            d="M36.667 73.333c-5.073 0-9.84-.962-14.3-2.887-4.461-1.925-8.342-4.538-11.642-7.838-3.3-3.3-5.912-7.18-7.837-11.641C.963 46.506 0 41.739 0 36.667c0-5.073.963-9.84 2.888-14.3 1.925-4.461 4.537-8.342 7.837-11.642 3.3-3.3 7.18-5.912 11.642-7.837C26.827.963 31.594 0 36.667 0c5.072 0 9.839.963 14.3 2.888 4.46 1.925 8.341 4.537 11.641 7.837 3.3 3.3 5.913 7.18 7.838 11.642 1.925 4.46 2.887 9.227 2.887 14.3 0 5.072-.962 9.839-2.887 14.3-1.925 4.46-4.538 8.341-7.838 11.641-3.3 3.3-7.18 5.913-11.641 7.838-4.461 1.925-9.228 2.887-14.3 2.887Zm0-7.333c3.3 0 6.477-.535 9.533-1.604a29.15 29.15 0 0 0 8.433-4.63L13.567 18.7a29.15 29.15 0 0 0-4.63 8.433 28.65 28.65 0 0 0-1.604 9.534c0 8.189 2.842 15.125 8.525 20.808C21.542 63.158 28.478 66 36.667 66Zm23.1-11.367a29.15 29.15 0 0 0 4.629-8.433A28.648 28.648 0 0 0 66 36.667c0-8.19-2.842-15.125-8.525-20.809-5.683-5.683-12.62-8.525-20.808-8.525-3.3 0-6.478.535-9.534 1.604a29.15 29.15 0 0 0-8.433 4.63l41.067 41.066Z"
        />
    </svg>
)

export const IconStrikethrough = (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            fill="currentColor"
            d="M17.154 14c.23.516.346 1.09.346 1.72 0 1.342-.524 2.392-1.571 3.147C14.88 19.622 13.433 20 11.586 20c-1.64 0-3.263-.381-4.87-1.144V16.6c1.52.877 3.075 1.316 4.666 1.316 2.551 0 3.83-.732 3.839-2.197a2.21 2.21 0 0 0-.648-1.603l-.12-.117H3v-2h18v2h-3.846Zm-4.078-3H7.629a4.086 4.086 0 0 1-.481-.522C6.716 9.92 6.5 9.246 6.5 8.452c0-1.236.466-2.287 1.397-3.153C8.83 4.433 10.271 4 12.222 4c1.471 0 2.879.328 4.222.984v2.152c-1.2-.687-2.515-1.03-3.946-1.03-2.48 0-3.719.782-3.719 2.346 0 .42.218.786.654 1.099.436.313.974.562 1.613.75.62.18 1.297.414 2.03.699Z"
        />
    </svg>
)

export const IconSun = ({ strokeWidth = 1.5, ...props }: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        />
    </svg>
)

export const IconUnderline = (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            fill="currentColor"
            d="M8 3v9a4 4 0 1 0 8 0V3h2v9a6 6 0 1 1-12 0V3h2ZM4 20h16v2H4v-2Z"
        />
    </svg>
)

export const IconWarningCircle = (props: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 6.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V7a.75.75 0 0 1 .75-.75ZM12.512 16.441a.75.75 0 0 1 .056 1.06l-.01.01a.75.75 0 1 1-1.115-1.003l.01-.01a.75.75 0 0 1 1.059-.057Z"
            clipRule="evenodd"
        />
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5ZM1.25 12C1.25 6.063 6.063 1.25 12 1.25S22.75 6.063 22.75 12 17.937 22.75 12 22.75 1.25 17.937 1.25 12Z"
            clipRule="evenodd"
        />
    </svg>
)

export const IconWarningTriangle = (props: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M9.616 3.641c1.057-1.838 3.71-1.838 4.768 0l8.043 13.988c1.054 1.833-.27 4.121-2.384 4.121H3.957c-2.115 0-3.438-2.288-2.384-4.12L9.616 3.64Zm3.468.748a1.25 1.25 0 0 0-2.168 0L2.873 18.377a1.25 1.25 0 0 0 1.084 1.873h16.086a1.25 1.25 0 0 0 1.084-1.873L13.084 4.389Z"
            clipRule="evenodd"
        />
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 8.25a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM12.512 16.441a.75.75 0 0 1 .056 1.06l-.01.01a.75.75 0 1 1-1.115-1.003l.01-.01a.75.75 0 0 1 1.059-.057Z"
            clipRule="evenodd"
        />
    </svg>
)

export const IconXMark = ({ strokeWidth = 1.5, ...props }: ComponentProps<"svg">) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M6.757 17.243 12 12m5.243-5.243L12 12m0 0L6.757 6.757M12 12l5.243 5.243"
        />
    </svg>
)
