import * as React from "react"
import {Ref} from "react"
import {createEventComponent, PresentationalEventComponent} from "react-timeline"

type EventComponentProps = { label: string, vacation?: boolean }

export const mergeRefs = <T, >(...refs: Array<Ref<T>>) => (ref: T) => {
    refs.forEach((resolvableRef) => {
        if (typeof resolvableRef === 'function') {
            resolvableRef(ref)
        } else {
            (resolvableRef as any).current = ref
        }
    })
}

let MyEventComponent: PresentationalEventComponent<EventComponentProps> = (
    {
        x,
        y,
        width,
        height,
        dragHandle,
        dragStartHandle,
        dragEndHandle,
        groupHeight,
        label,
        selected,
        vacation,
        buffer,
    }) => {

    if (vacation) {
        let ref = mergeRefs(dragEndHandle, dragHandle, dragStartHandle)
        return <g>
            <g ref={ref}/>
            <rect fill={'rgba(0,0,0,0.3)'} y={y - 15} height={groupHeight} x={x} width={width}/>
            <foreignObject y={y - 12} height={groupHeight} x={x} width={width}
                           style={{pointerEvents: 'none', textAlign: 'center', verticalAlign: 'middle'}}>
                <div className={'react-timeline-event'}>
                    Urlaub
                </div>
            </foreignObject>
        </g>
    } else if (buffer) {
        let ref = mergeRefs(dragEndHandle, dragHandle, dragStartHandle)
        return <g>
            <g ref={ref}/>
            <line x1={x} x2={x + width} y1={y + height / 2} y2={y + height / 2} stroke={'black'}/>
            <line x1={x + width} x2={x + width} y1={y + height / 2 - 4} y2={y + height / 2 + 4} stroke={"black"}/>
        </g>
    } else {
        return <g>
            <rect ref={dragHandle} fill={selected ? 'rgba(255,0,0,0.8)' : 'rgba(200,10,0,0.8)'} height={height}
                  style={{paintOrder: 'stroke'}} y={y} x={x}
                  rx={3} ry={3}
                  width={width}/>
            <rect ref={dragStartHandle} fill={'rgba(0,0,0,0)'} y={y - 0.25 * height} height={1.5 * height} x={x - 22}
                  width={22 + Math.min(22, width / 2)}
                  style={{cursor: 'ew-resize'}} visibility={selected ? 'display' : 'hidden'}/>
            <rect ref={dragEndHandle} fill={'rgba(0,0,0,0)'} y={y - 0.25 * height} height={1.5 * height}
                  x={x + width - Math.min(22, width / 2)} width={22 + Math.min(22, width / 2)}
                  style={{cursor: 'ew-resize'}} visibility={selected ? 'display' : 'hidden'}/>
            <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none', padding: 2}}>
                <div className={'react-timeline-event'}>
                    {label}
                </div>
            </foreignObject>
        </g>
    }
}

export const EventComponent = createEventComponent(MyEventComponent)