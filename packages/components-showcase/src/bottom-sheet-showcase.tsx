import { Badge } from "ui-components/badge"
import {
    BottomSheetClose,
    BottomSheetContent,
    BottomSheetDescription,
    BottomSheetRoot,
    BottomSheetTitle,
    BottomSheetTrigger,
} from "ui-components/bottom-sheet"
import { Button } from "ui-components/button"
import { TickProgress } from "ui-components/tick-progress"

export const BottomSheetShowcase = () => (
    <BottomSheetRoot>
        <BottomSheetTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open bottom sheet
                </Button>
            }
        />
        <BottomSheetContent>
            <div className="flex items-center justify-between">
                <Badge tone="live" dot={true}>
                    Ongoing
                </Badge>
                <span className="tp-pixel-sm">1h12m left</span>
            </div>
            <BottomSheetTitle typography="override" className="tp-pixel-xl">
                Jazz at the Cloister
            </BottomSheetTitle>
            <BottomSheetDescription>San Domenico Cloister</BottomSheetDescription>
            <TickProgress label="Elapsed" value={64} min={0} max={100} />
            <BottomSheetClose
                render={
                    <Button variant="primary" size="md" type="button">
                        Close
                    </Button>
                }
            />
        </BottomSheetContent>
    </BottomSheetRoot>
)
