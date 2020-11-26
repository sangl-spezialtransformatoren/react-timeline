import {createContext} from "react"

type ReactTimelineContext = {
    startDate: Date | number
    timePerPixel: number
    svgWidth: number
    svgHeight: number
}

export const ReactTimelineContext = createContext<ReactTimelineContext>({
    startDate: new Date(),
    timePerPixel: 86400,
    svgWidth: 1,
    svgHeight: 1
})