import React, {CSSProperties, useEffect, useState} from "react"
import useResizeObserver from "use-resize-observer"
import {Canvas} from "./canvas"

export type TimelineState = {
    startDate: Date | number
    endDate: Date | number
}

export type TimelineProps = {
    width?: CSSProperties["width"]
    height?: CSSProperties["height"]
    state: TimelineState
    setState: React.Dispatch<React.SetStateAction<TimelineState | undefined>>
}

export const Timeline: React.FC<TimelineProps> = ({state, width, height, children}) => {
    let {startDate, endDate} = state
    let [timePerPixel, setTimePerPixel] = useState<number>(0)

    let {ref, width: actualWidth, height: actualHeight} = useResizeObserver<HTMLDivElement>()

    useEffect(() => {
        if (actualWidth !== undefined && actualHeight !== undefined) {
            setTimePerPixel((endDate.valueOf() - startDate.valueOf()) / actualWidth)
        }
    })

    return <div ref={ref} style={{width: width, height: height, margin: 0, padding: 0}}>
        <Canvas startTime={startDate} timePerPixel={timePerPixel}>
            {children}
        </Canvas>
    </div>
}