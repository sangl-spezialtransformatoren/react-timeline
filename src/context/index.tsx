import React from "react"
import {BusinessLogic} from "../store/businessLogic"
import {StartDateAnimationContext, TimePerPixelAnimationContext} from "./springs"
import {TimelineBusinessLogic} from "./businessLogic"

export {useStartDateSpring, useTimePerPixelSpring} from "./springs"
export {useBusinessLogic} from "./businessLogic"
export const TimelineContext: React.FC<{ businessLogic: BusinessLogic }> = (
    {
        businessLogic,
        children
    }) => {
    return <>
        <StartDateAnimationContext>
            <TimePerPixelAnimationContext>
                <TimelineBusinessLogic config={businessLogic}>
                    {children}
                </TimelineBusinessLogic>
            </TimePerPixelAnimationContext>
        </StartDateAnimationContext>
    </>
}


