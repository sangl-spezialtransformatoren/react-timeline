import React, {useContext, useEffect, useState} from "react"
import {v4 as uuidv4} from 'uuid'
import {TimelineContext} from "./timeline"

export type GridProps = {
    startDate: Date | number
    interval: Date | number
}

export const Grid: React.FC<GridProps> = ({startDate, interval, ...props}) => {
    let [id, setId] = useState<string>("")
    let {timePerPixel, dateZero: canvasInitialStartDate, startDate: canvasStartDate} = useContext(TimelineContext)

    let intervalInPixels = interval.valueOf() / timePerPixel.valueOf()
    let offset = (startDate.valueOf() - canvasInitialStartDate.valueOf()) / timePerPixel.valueOf()

    useEffect(() => {
        setId(uuidv4())
    }, [])

    return <>
        <pattern id={id} width={intervalInPixels} height="1" x={offset} patternUnits="userSpaceOnUse">
            <path d={"M 0 0 L 0 " + intervalInPixels.toString() + " 0 0"}
                  shapeRendering="crispEdges" {...{stroke: "gray", strokeWidth: 1, ...props}} />
        </pattern>
        <rect x={(canvasStartDate.valueOf() - canvasInitialStartDate.valueOf()) / timePerPixel} y={0} width={"100%"}
              height={"100%"} fill={"url(#" + id + ")"}/>
    </>
}
