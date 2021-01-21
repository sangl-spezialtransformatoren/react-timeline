import {createEventComponent, PresentationalEventComponent} from "../event"
import React from "react"

export const DefaultEventComponent: PresentationalEventComponent = (
    {
        x,
        y,
        width,
        height,
        dragHandle,
        dragStartHandle,
        dragEndHandle,
    }) => {
    return <g style={{touchAction: "pan-y"}}>
        <rect ref={dragHandle} fill={'gray'} height={height} style={{paintOrder: 'stroke'}} y={y} x={x}
              width={width} filter="url(#dropshadow)"/>
        <rect ref={dragStartHandle} fill={'transparent'} y={y} height={height} x={x} width={10}
              style={{cursor: 'ew-resize'}}/>
        <rect ref={dragEndHandle} fill={'transparent'} y={y} height={height} x={x + width} width={10}
              style={{cursor: 'ew-resize'}}
              transform={'translate(-10, 0)'}/>
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'}>
                Test
            </div>
        </foreignObject>
    </g>
}
export const EventComponent = createEventComponent(DefaultEventComponent)