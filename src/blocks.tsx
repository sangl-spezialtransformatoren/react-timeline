import React, {useEffect, useState} from 'react'
import {TimelineData, TimelineEvent} from './definitions'
import {compareAsc, Interval} from 'date-fns'
import {animated, useSpring} from 'react-spring'
import {areIntervalsIntersecting} from "schedule-fns/lib/src/functions/intervals"
import {EventPresentationalComponentProps} from "./event"
import {EventComponent} from "./presentational"
import {useAnimate} from "./store/animate"
import {useInitialized} from "./store/initialized"
import {useSpringConfig} from "./store/springConfig"


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
        let positions = Object.values(positionedEvents).filter(
            (leftEvent) => areIntervalsIntersecting(leftEvent.interval, evt.interval) && leftEvent.interval.end !== evt.interval.start && leftEvent.interval.start !== evt.interval.end
        ).map((leftEvent) => leftEvent.position)
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

    let animate = useAnimate()
    let initialized = useInitialized()
    let springConfig = useSpringConfig()

    let [{height}] = useSpring({
        height: (Math.max(...Object.values(eventsWithPositions).map(event => event.position)) + 1) * 20,
        config: springConfig,
        immediate: !animate || !initialized
    }, [eventsWithPositions, animate, initialized])

    useEffect(() => {
        setEventsWithPositions(distributeEventsVertically(orderEventsForPositioning(events)))
    }, [events])

    return <g>
        {Object.entries(eventsWithPositions).map(([id, event]) => {
            return <EventComponent id={id} interval={event.interval} y={22 * event.position} label={event.label!}/>
        })}
        <animated.rect x={0} y={0} height={height} width={100} fill={'yellow'}/>
    </g>
}

export type TimeRectProps = {
    id: any,
    interval: Interval,
    label?: string,
    y: number,
    component?: React.FC<EventPresentationalComponentProps>
}


