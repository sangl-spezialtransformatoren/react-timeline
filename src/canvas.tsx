import React from "react"
import {ReactTimelineContext} from "./context"
import useResizeObserver from "use-resize-observer"


type CanvasProps = {
    startTime: Date | number
    timePerPixel: number
}

export const Canvas: React.FC<CanvasProps> = ({children, startTime, timePerPixel}) => {
    let {ref, width: svgWidth = 1, height: svgHeight = 1} = useResizeObserver<HTMLDivElement>()

    return <>
        <ReactTimelineContext.Provider value={{startDate: startTime, timePerPixel, svgWidth, svgHeight}}>
            <div ref={ref} style={{width: "100%", padding: 0, margin: 0}}>
                <svg width={"100%"}>
                    {children}
                </svg>
            </div>
        </ReactTimelineContext.Provider>
    </>
}
