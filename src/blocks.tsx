import React, {SVGProps, useContext, useEffect, useRef, useState} from 'react'
import {TimelineContext, TimelineData, TimelineEvent} from './definitions'
import {compareAsc, Interval} from 'date-fns'
import {animated, AnimatedProps, useSpring} from 'react-spring'
import {useGesture} from 'react-use-gesture'
import {areIntervalsIntersecting} from "schedule-fns/lib/src/functions/intervals"


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
    let {springConfig} = useContext(TimelineContext)

    let [{height}] = useSpring({
        height: (Math.max(...Object.values(eventsWithPositions).map(event => event.position)) + 1) * 20,
        config: springConfig
    }, [eventsWithPositions])

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
    y: number
} & Omit<AnimatedProps<SVGProps<SVGRectElement>>, 'ref' | 'y'>


export const TimeRect: React.FC<TimeRectProps> = ({interval, ...props}) => {
    let ref = useRef<SVGRectElement>(null)
    let startRef = useRef<SVGRectElement>(null)
    let endRef = useRef<SVGRectElement>(null)

    let {
        startDate,
        timePerPixel,
        springConfig,
        onEventDrag,
        onEventDragStart,
        onEventDragEnd,
        state,
        setState
    } = useContext(TimelineContext)

    let [{x, width, x1, y}] = useSpring({
        x: (interval.start.valueOf() - startDate.valueOf()) / timePerPixel,
        x1: (interval.end.valueOf() - startDate.valueOf()) / timePerPixel,
        width: (interval.end.valueOf() - interval.start.valueOf()) / timePerPixel,
        y: props.y,
        config: springConfig
    }, [interval, springConfig, props.y, startDate])

    let transform = y.to(y => `translate(0, ${y * 22})`)

    useGesture({
        onDrag: eventState => onEventDrag?.({state, setState, eventState, id: props.id})
    }, {domTarget: ref, eventOptions: {passive: false}})

    useGesture({
        onDrag: eventState => onEventDragStart?.({state, setState, eventState, id: props.id})
    }, {domTarget: startRef, eventOptions: {passive: false}})

    useGesture({
        onDrag: eventState => onEventDragEnd?.({state, setState, eventState, id: props.id})
    }, {domTarget: endRef, eventOptions: {passive: false}})

    return <animated.g transform={transform}>
        <animated.rect ref={ref} fill={'gray'} height={20} style={{paintOrder: "stroke"}}{...props} y={0} x={x}
                       width={width} filter="url(#dropshadow)"/>
        <animated.rect ref={startRef} fill={'transparent'} y={0} height={20} x={x} width={10}
                       style={{cursor: 'ew-resize'}}/>
        <animated.rect ref={endRef} fill={'transparent'} y={0} height={20} x={x1} width={10}
                       style={{cursor: 'ew-resize'}}
                       transform={'translate(-10, 0)'}/>
        <animated.foreignObject y={0} height={20} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'}>
                {props.label}
            </div>
        </animated.foreignObject>
    </animated.g>
}