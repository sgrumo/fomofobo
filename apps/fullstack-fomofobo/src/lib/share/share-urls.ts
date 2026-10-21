import { match } from "ts-pattern"

export type ShareTarget = "whatsapp" | "telegram" | "facebook" | "x"

/**
 * @description Builds the URL that opens the share flow of the target with the link and the
 * text
 * @param target App that receives the link
 * @param shared Link and text of the share
 * @remarks Drops the text for Facebook, whose sharer reads the card of the link alone
 */
export const shareUrlOf = (
    target: ShareTarget,
    shared: { url: string; text: string },
): string => {
    const url = encodeURIComponent(shared.url)
    const text = encodeURIComponent(shared.text)
    return match(target)
        .with("whatsapp", () => `https://wa.me/?text=${text}%20${url}`)
        .with("telegram", () => `https://t.me/share/url?url=${url}&text=${text}`)
        .with("facebook", () => `https://www.facebook.com/sharer/sharer.php?u=${url}`)
        .with("x", () => `https://x.com/intent/tweet?url=${url}&text=${text}`)
        .exhaustive()
}
