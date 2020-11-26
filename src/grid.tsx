import React, {useContext, useEffect, useState} from "react"
import {v4 as uuidv4} from 'uuid'
import {ReactTimelineContext} from "./context"

export type GridProps = {
    startDate: Date | number
    interval: Date | number
} & React.SVGAttributes<SVGPathElement>

export const Grid: React.FC<GridProps> = ({startDate, interval, ...props}) => {
    let [id, setId] = useState<string>("")
    let {timePerPixel, startDate: canvasStartDate} = useContext(ReactTimelineContext)

    let intervalInPixels = interval.valueOf() / timePerPixel.valueOf()
    let offset = (startDate.valueOf() - canvasStartDate.valueOf()) / timePerPixel.valueOf()

    useEffect(() => {
        setId(uuidv4())
    }, [])

    return <>
        <pattern id={id} width={intervalInPixels} height="1" x={offset} patternUnits="userSpaceOnUse">
            <path d={"M 0 0 L 0 " + intervalInPixels.toString() + " 0 0"}
                  shapeRendering="crispEdges" {...props} />
        </pattern>
        <rect width={"100%"} height={"100%"} fill={"url(#" + id + ")"}/>
    </>
}

export const defaultGetInterval: AdaptiveGridProps["getInterval"] = (canvasInterval) => {
    let intervals = [1000, 60 * 1000, 60 * 60 * 1000, 24 * 3600 * 1000, 7 * 24 * 3600 * 1000, 365.25 * 3600 * 1000]
    let interval = intervals.find(interval => (canvasInterval.valueOf() / interval) < 150)
    return [new Date().valueOf(), interval || 3600000]
}

export type AdaptiveGridProps = {
    getInterval?: (canvasInterval: Date | number, timePerPixel: Date | number) => [Date | number, Date | number]
} & React.SVGAttributes<SVGPathElement>

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({getInterval = defaultGetInterval, ...props}) => {
    let {svgWidth, timePerPixel} = useContext(ReactTimelineContext)
    let canvasInterval = svgWidth * timePerPixel.valueOf()
    let [startDate, interval] = getInterval(canvasInterval, timePerPixel)

    return <Grid startDate={startDate} interval={interval} {...props}/>
}