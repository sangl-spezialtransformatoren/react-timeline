import React from "react"
import {DayHeaderComponent} from "../headers/DayHeader"

export const DefaultDayHeader: DayHeaderComponent = ({x, y, width, height}) => {
    return <g>
        <rect x={x} y={y} width={width} height={height}/>
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: "center"}}>
                Test
            </div>
        </foreignObject>
    </g>
}
