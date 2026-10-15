import {
    BottomSheetClose,
    BottomSheetContent,
    BottomSheetRoot,
    BottomSheetTitle,
    BottomSheetTrigger,
} from "ui-components/bottom-sheet"
import { Button } from "ui-components/button"

export const BottomSheetSamples = () => (
    <BottomSheetRoot>
        <BottomSheetTrigger
            render={
                <Button variant="secondary" size="md" type="button">
                    Open sample bottom sheet
                </Button>
            }
        />
        <BottomSheetContent>
            <BottomSheetTitle>Sample bottom sheet</BottomSheetTitle>
            <p>Sample bottom sheet content</p>
            <BottomSheetClose
                render={
                    <Button variant="primary" size="md" type="button">
                        Close sample bottom sheet
                    </Button>
                }
            />
        </BottomSheetContent>
    </BottomSheetRoot>
)
