import React, {MutableRefObject, useContext, useEffect, useRef, useState} from 'react'
import {TimelineContext, TimelineData, TimelineEvent} from './definitions'
import {compareAsc, Interval} from 'date-fns'
import {animated, to, useSpring} from 'react-spring'
import {useGesture} from 'react-use-gesture'
import {areIntervalsIntersecting} from "schedule-fns/lib/src/functions/intervals"


type EventComponentProps = {
    y: number,
    x: number,
    width: number,
    height: number,
    dragHandle: MutableRefObject<any>,
    dragStartHandle: MutableRefObject<any>,
    dragEndHandle: MutableRefObject<any>
}

type EventComponent = React.FC<EventComponentProps>

const DefaultEventComponent: EventComponent = (
    {
        x,
        y,
        width,
        height,
        dragHandle,
        dragStartHandle,
        dragEndHandle
    }) => {
    return <g>
        <rect ref={dragHandle} fill={'gray'} height={height} style={{paintOrder: "stroke"}} y={y} x={x}
              width={width} filter="url(#dropshadow)"/>
        <rect ref={dragStartHandle} fill={'transparent'} y={y} height={height} x={x} width={10}
              style={{cursor: 'ew-resize'}}/>
        <rect ref={dragEndHandle} fill={'transparent'} y={y} height={height} x={x + width} width={10}
              style={{cursor: 'ew-resize'}}
              transform={'translate(-10, 0)'}/>
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'}>
                Test2
            </div>
        </foreignObject>
    </g>
}

export type EventGroupProps = {
    events: TimelineData['events']
}

function orderEventsForPositioning(events: Record<string, TimelineEvent>): [string, TimelineEvent][] {
    let eventsOrderedByTime = Object.entries(events).sort(([_, evtA], [__, evtB]) => compareAsc(evtA.interval.start, evtB.interval.start))
    return [
        ...eventsOrderedByTime.filter(([_, evt]) => !evt?.manipulated),
        ...eventsOrderedByTime.filter(([_, evt]) => !!evt?.manipulated)
    ]
}

function distributeEventsVertically(events: [string, TimelineEvent][]): Record<string, (TimelineEvent & { position: number })> {
    let positionedEvents: Record<string, (TimelineEvent & { position: number })> = {}
    for (const [key, evt] of events) {
        let positions = Object.values(positionedEvents).filter((leftEvent) => areIntervalsIntersecting(leftEvent.interval, evt.interval)).map((leftEvent) => leftEvent.position)
        let position = 0
        while (positions.includes(position)) {
            position++
        }
        positionedEvents = {...positionedEvents, [key]: {...evt, position}}
    }
    return positionedEvents
}


export const EventGroup: React.FC<EventGroupProps> = ({events}) => {
    let [eventsWithPositions, setEventsWithPositions] = useState<{ [id: string]: TimelineEvent & { position: number } }>({})
    let {springConfig, animate, initialized} = useContext(TimelineContext)

    let [{height}] = useSpring({
        height: (Math.max(...Object.values(eventsWithPositions).map(event => event.position)) + 1) * 20,
        config: springConfig,
        immediate: !animate || !initialized
    }, [eventsWithPositions, animate])

    useEffect(() => {
        setEventsWithPositions(distributeEventsVertically(orderEventsForPositioning(events)))
    }, [events])

    return <g>
        {Object.entries(eventsWithPositions).map(([id, event]) => {
            return <TimeRect id={id} interval={event.interval} y={event.position} label={event.label}/>
        })}
        <animated.rect x={0} y={0} height={height} width={100} fill={'yellow'}/>
    </g>
}

export type TimeRectProps = {
    id: any,
    interval: Interval,
    label?: string,
    y: number,
    component?: React.FC<EventComponentProps>
}


export const TimeRect: React.FC<TimeRectProps> = ({interval, component, y, id}) => {
    let ref = useRef<SVGRectElement>(null)
    let startRef = useRef<SVGRectElement>(null)
    let endRef = useRef<SVGRectElement>(null)

    let {
        timePerPixelSpring,
        springConfig,
        onEventDrag,
        onEventDragStart,
        onEventDragEnd,
        state,
        setState,
        animate,
        dateZero
    } = useContext(TimelineContext)

    let [{ySpring, intervalStartSpring, intervalEndSpring}] = useSpring({
        intervalStartSpring: interval.start,
        intervalEndSpring: interval.end,
        ySpring: y,
        config: springConfig,
        immediate: !animate
    }, [springConfig, y, interval.start, interval.end, animate])

    let xSpring = to([timePerPixelSpring, intervalStartSpring], (timePerPixel, intervalStart) => (intervalStart.valueOf() - dateZero.valueOf()) / timePerPixel.valueOf())
    let widthSpring = to([timePerPixelSpring, intervalStartSpring, intervalEndSpring], (timePerPixel, intervalStart, intervalEnd) => (intervalEnd.valueOf() - intervalStart.valueOf()) / timePerPixel.valueOf())

    useGesture({
        onDrag: eventState => onEventDrag?.({state, setState, eventState, id})
    }, {domTarget: ref, eventOptions: {passive: false}})

    useGesture({
        onDrag: eventState => onEventDragStart?.({state, setState, eventState, id})
    }, {domTarget: startRef, eventOptions: {passive: false}})

    useGesture({
        onDrag: eventState => onEventDragEnd?.({state, setState, eventState, id})
    }, {domTarget: endRef, eventOptions: {passive: false}})

    component = component || DefaultEventComponent
    let PresentationalComponent = animated(component)

    return <PresentationalComponent
        x={xSpring}
        y={ySpring}
        width={widthSpring}
        height={20}
        dragHandle={ref}
        dragStartHandle={startRef}
        dragEndHandle={endRef}/>
}