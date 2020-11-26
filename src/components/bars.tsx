import React, {useContext} from "react"
import {ReactTimelineContext} from "../context"
import {differenceInMilliseconds, Interval} from "date-fns"

export type BarProps = {
    interval: Interval
    label: string
    y: React.SVGAttributes<SVGElement>["y"]
    height: React.SVGAttributes<SVGElement>["height"]
}

export type Bar<T = {}> = React.FC<BarProps & T>

export const ForeignObjectBar: Bar = ({interval, y, height, children}) => {
    let {startDate, timePerPixel} = useContext(ReactTimelineContext)

    let x = differenceInMilliseconds(interval.start, startDate) / timePerPixel
    let width = differenceInMilliseconds(interval.end, interval.start) / timePerPixel

    return <g>
        <foreignObject x={x} y={y} width={width} height={height}>
            {children}
        </foreignObject>
    </g>
}

export const DivBar: Bar<React.HTMLAttributes<HTMLDivElement>> = ({interval, label, y, height, ...props}) => {
    return <ForeignObjectBar interval={interval} label={label} y={y} height={height}>
        <div {...props} style={{boxSizing: "border-box", width: "100%", height: "100%", ...props.style}}>
            {label}
        </div>
    </ForeignObjectBar>
}