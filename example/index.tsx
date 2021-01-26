import 'react-app-polyfill/ie11'
import * as React from 'react'
import {Ref} from 'react'
import * as ReactDOM from 'react-dom'
import {
    AutomaticGrid,
    AutomaticHeader,
    BusinessLogic,
    createEventComponent,
    DefaultBusinessLogic,
    DragOffset,
    InitialTimelineParameters,
    makePureInterval,
    Now,
    PresentationalEventComponent,
    RequiredEventData,
    RequiredGroupData,
    Timeline,
    TimelineEvents,
} from 'react-timeline'
import 'react-timeline/bundle.css'
import {addDays, addHours, startOfDay} from 'date-fns'


type EventData =
    RequiredEventData
    & { label: string, vacation?: boolean, link: string, buffer?: boolean }
type GroupData = RequiredGroupData & { label: string }
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
        return <g style={{touchAction: 'pan-y'}}>
            <g ref={ref}/>
            <rect fill={'rgba(0,0,0,0.3)'} y={y} height={groupHeight} x={x} width={width}/>
            <foreignObject y={y} height={groupHeight} x={x} width={width}
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
            <line x1={x} x2={x + width - 3} y1={y + height / 2} y2={y + height / 2} stroke={'black'}/>
            <circle cx={x + width} cy={y + height / 2} stroke={'black'} r={3} fill={'none'}/>
        </g>
    } else {
        return <g style={{touchAction: 'pan-y'}}>
            <rect ref={dragHandle} fill={selected ? 'rgba(255,0,0,0.8)' : 'rgba(0,0,0,0.8)'} height={height}
                  style={{paintOrder: 'stroke'}} y={y} x={x}
                  rx={3} ry={3}
                  width={width} filter="url(#dropshadow)"/>
            <rect ref={dragStartHandle} fill={'rgba(0,0,0,0.2)'} y={y} height={height} x={x} width={10}
                  style={{cursor: 'ew-resize'}} visibility={selected ? 'display' : 'hidden'}/>
            <rect ref={dragEndHandle} fill={'rgba(0,0,0,0.2)'} y={y} height={height} x={x + width} width={10}
                  style={{cursor: 'ew-resize'}}
                  transform={'translate(-10, 0)'} visibility={selected ? 'display' : 'hidden'}/>
            <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none', padding: 2}}>
                <div className={'react-timeline-event'}>
                    {label}
                </div>
            </foreignObject>
        </g>
    }
}

let EventComponent = createEventComponent(MyEventComponent)

let businessLogic: BusinessLogic<EventData, GroupData, EventComponentProps> = {
    ...DefaultBusinessLogic,
    mapEventsToProps: data => data,
    mapEventsToLayer: data => {
        return Object.fromEntries(Object.entries(data).map(([eventId, event]) => [eventId, event.vacation ? 0 : 1]))
    },
    displayEventsInSameRow: events => {
        let links = Array.from(new Set(Object.keys(events).map(eventId => events[eventId].link)))
        return links.map(link => Object.keys(events).filter(eventId => events[eventId].link === link))
    },
    validateDuringDrag: ({events, newIntervals, newGroups}) => {
        let newEvents = {...events}
        for (let [eventId, newInterval] of Object.entries(newIntervals)) {
            let start = startOfDay(addHours(newInterval.start, 12))
            let startPlus1Day = startOfDay(addDays(start, 1))
            let end = startOfDay(addHours(newInterval.end, 12))
            let validatedInterval = makePureInterval({
                start: start,
                end: Math.max(end.valueOf(), startPlus1Day.valueOf()),
            })
            newEvents = {
                ...newEvents,
                [eventId]: {
                    ...newEvents[eventId],
                    interval: validatedInterval
                }
            }

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let eventId of Object.keys(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        interval: {
                            ...newEvents[eventId].interval,
                            start: validatedInterval.end
                        }
                    }
                }
            }
        }
        for (let [eventId, newGroupId] of Object.entries(newGroups)) {
            newEvents[eventId].groupId = newGroupId

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let [eventId, event] of Object.entries(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        groupId: newGroupId
                    }
                }
            }
        }
        return {events: newEvents}
    },
    validateAfterDrag: async ({events, newIntervals, newGroups}) => {
        let newEvents = {...events}
        for (let [eventId, newInterval] of Object.entries(newIntervals)) {
            let start = startOfDay(addHours(newInterval.start, 12))
            let startPlus1Day = startOfDay(addDays(start, 1))
            let end = startOfDay(addHours(newInterval.end, 12))
            let validatedInterval = makePureInterval({
                start: start,
                end: Math.max(end.valueOf(), startPlus1Day.valueOf()),
            })
            newEvents = {
                ...newEvents,
                [eventId]: {
                    ...newEvents[eventId],
                    interval: validatedInterval
                }
            }

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let eventId of Object.keys(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        interval: {
                            ...newEvents[eventId].interval,
                            start: validatedInterval.end
                        }
                    }
                }
            }
        }
        for (let [eventId, newGroupId] of Object.entries(newGroups)) {
            newEvents[eventId].groupId = newGroupId

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let eventId of Object.keys(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        groupId: newGroupId
                    }
                }
            }
        }
        return {events: newEvents}
    },
    validateDuringResize: ({events, newIntervals}) => {
        let newEvents = {...events}
        for (let [eventId, newInterval] of Object.entries(newIntervals)) {
            let start = startOfDay(addHours(newInterval.start, 12))
            let startPlus1Day = startOfDay(addDays(start, 1))
            let end = startOfDay(addHours(newInterval.end, 12))
            let validatedInterval = makePureInterval({
                start: start,
                end: Math.max(end.valueOf(), startPlus1Day.valueOf()),
            })
            newEvents = {
                ...newEvents,
                [eventId]: {
                    ...newEvents[eventId],
                    interval: validatedInterval
                }
            }

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let eventId of Object.keys(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        interval: {
                            ...newEvents[eventId].interval,
                            start: validatedInterval.end
                        }
                    }
                }
            }
        }
        return {events: newEvents}
    },
    validateAfterResize: async ({events, newIntervals}) => {
        let newEvents = {...events}
        for (let [eventId, newInterval] of Object.entries(newIntervals)) {
            let start = startOfDay(addHours(newInterval.start, 12))
            let startPlus1Day = startOfDay(addDays(start, 1))
            let end = startOfDay(addHours(newInterval.end, 12))
            let validatedInterval = makePureInterval({
                start: start,
                end: Math.max(end.valueOf(), startPlus1Day.valueOf()),
            })
            newEvents = {
                ...newEvents,
                [eventId]: {
                    ...newEvents[eventId],
                    interval: validatedInterval
                }
            }

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let eventId of Object.keys(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        interval: {
                            ...newEvents[eventId].interval,
                            start: validatedInterval.end
                        }
                    }
                }
            }
        }
        return {events: newEvents}
    },

}

const App = () => {
    let date = 0
    let initialParameters: InitialTimelineParameters = {
        startDate: date,
        endDate: addDays(date, 28).valueOf(),
    }


    let initialData: { events: Record<string, EventData>, groups: Record<string, GroupData> } = {
        events: {
            '1': {
                interval: {start: date, end: date.valueOf() + 100 * 3600000},
                label: 'IT 18.128',
                groupId: '1',
                vacation: true,
                link: '1',
            },
            '2': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                groupId: '1',
                link: '2',
            },
            '2-': {
                interval: {start: date.valueOf() + 10 * 3600000, end: date.valueOf() + 10 * 7200000},
                label: 'IT 18.128 - Lieferzeit',
                groupId: '1',
                link: '2',
                buffer: true,
            },
            '3': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: 'IT 18.129',
                groupId: '1',
                link: '3',
            },
            '4': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                groupId: '2',
                link: '4',
            },
            '5': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                groupId: '3',
                link: '5',
            },
        },
        groups: {
            '1': {
                label: '1',
            },
            '2': {
                label: '2',
            },
        },

    }

    return <Timeline
        initialData={initialData}
        initialParameters={initialParameters}
        style={{height: '100%', width: '100%'}}
        timeZone={'Europe/Berlin'}
        animate={true}
        springConfig={{mass: 0.8, tension: 210, friction: 20}}
        businessLogic={businessLogic}
    >
        <AutomaticGrid/>
        <AutomaticHeader/>
        <TimelineEvents EventComponent={EventComponent}/>
        <DragOffset>
            <Now/>
        </DragOffset>

    </Timeline>
}

ReactDOM.render(<App/>, document.getElementById('root'))
