import 'react-app-polyfill/ie11'
import * as React from 'react'
import {Ref, useEffect, useState} from 'react'
import * as ReactDOM from 'react-dom'
import {
    AutomaticGrid,
    BusinessLogic,
    createEventComponent,
    DayHeader,
    DefaultBusinessLogic,
    Events,
    GroupBackgrounds,
    GroupLabels,
    Header,
    InitialTimelineParameters,
    makePureInterval,
    Now,
    PresentationalEventComponent,
    RequiredEventData,
    RequiredGroupData,
    Timeline,
    WeekHeader
} from 'react-timeline'
import 'react-timeline/bundle.css'
import {addDays, addHours, startOfDay} from 'date-fns'


type EventData =
    RequiredEventData
    & { label: string, vacation?: boolean, link: string, buffer?: boolean, manipulated?: boolean }
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

let EventComponent = createEventComponent(MyEventComponent)

let businessLogic: BusinessLogic<EventData, GroupData, EventData, GroupData> = {
    ...DefaultBusinessLogic,
    mapEventsToProps: data => data,
    mapEventsToLayer: data => {
        return Object.fromEntries(Object.entries(data).map(([eventId, event]) => [eventId, event.vacation ? 0 : 1]))
    },
    displayEventsInSameRow: events => {
        let links = Array.from(new Set(Object.keys(events).map(eventId => events[eventId].link)))
        return links.map(link => Object.keys(events).filter(eventId => events[eventId].link === link))
    },
    validateDuringDrag: function validateDuringDrag({events, newIntervals, newGroups}) {
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
                    interval: validatedInterval,
                },
            }

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let eventId of Object.keys(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        interval: {
                            ...newEvents[eventId].interval,
                            start: validatedInterval.end,
                        },
                    },
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
                        groupId: newGroupId,
                    },
                }
            }
        }
        return {events: newEvents}
    },
    validateAfterDrag: async function validateAfterDrag({events, newIntervals, newGroups}) {
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
                    interval: validatedInterval,
                    manipulated: true,
                },
            }

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let eventId of Object.keys(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        interval: {
                            ...newEvents[eventId].interval,
                            start: validatedInterval.end,
                        },
                        manipulated: true,
                    },
                }
            }
        }
        for (let [eventId, newGroupId] of Object.entries(newGroups)) {
            newEvents = {
                ...newEvents,
                [eventId]: {
                    ...newEvents[eventId],
                    groupId: newGroupId,
                    manipulated: true,
                },
            }

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let eventId of Object.keys(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        groupId: newGroupId,
                        manipulated: true,
                    },
                }
            }
        }
        return {events: newEvents}
    },
    validateDuringResize: function validateDuringResize({events, newIntervals}) {
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
                    interval: validatedInterval,
                },
            }

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let eventId of Object.keys(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        interval: {
                            ...newEvents[eventId].interval,
                            start: validatedInterval.end,
                        },
                    },
                }
            }
        }
        return {events: newEvents}
    },
    validateAfterResize: async function validateAfterResize({events, newIntervals}) {
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
                    interval: validatedInterval,
                    manipulated: true,
                },
            }

            let linkedEvents = Object.fromEntries(Object.entries(newEvents).filter(([linkedEventId, linkedEvent]) => linkedEvent.link === eventId && linkedEventId !== eventId))
            for (let eventId of Object.keys(linkedEvents)) {
                newEvents = {
                    ...newEvents,
                    [eventId]: {
                        ...newEvents[eventId],
                        interval: {
                            ...newEvents[eventId].interval,
                            start: validatedInterval.end,
                        },
                        manipulated: true,
                    },
                }
            }
        }
        return {events: newEvents}
    },
    mergeNewEvents: (currentEvents, newEvents) => {
        return Object.fromEntries(Object.keys(newEvents).map(eventId => {
            if (currentEvents?.[eventId]?.manipulated) {
                return [eventId, {
                    ...currentEvents[eventId],
                    label: newEvents[eventId].label,
                }]
            } else {
                return [eventId, newEvents[eventId]]
            }
        }))
    },
    mergeNewGroups: (_, newGroups) => newGroups,
    mapGroupsToProps: data => data

}

const App = () => {
    let date = 0
    let initialParameters: InitialTimelineParameters = {
        startDate: date,
        endDate: addDays(date, 28).valueOf(),
    }

    let [x, setX] = useState(0)

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
                label: `IT 18.128`,
                groupId: '3',
                link: `5`,
            },
            '6': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: `IT 18.128`,
                groupId: '3',
                link: `6`,
            },
            '7': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: `IT 18.128`,
                groupId: '3',
                link: `7`,
            },
            '8': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: `IT 18.128`,
                groupId: '3',
                link: `8`,
            },
            '9': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: `IT 18.128`,
                groupId: '3',
                link: `9`,
            },
            '10': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: `IT 18.128`,
                groupId: '3',
                link: `10`,
            },
            '11': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: `IT 18.128`,
                groupId: '3',
                link: `11`,
            },
            '12': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: `IT 18.128`,
                groupId: '3',
                link: `12`,
            },
            '13': {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: `IT 18.128`,
                groupId: '3',
                link: `13`,
            },
        },
        groups: {
            '1': {
                label: '1',
            },
            '2': {
                label: `IT 18.128`,
            },
            '3': {
                label: '3',
            },
            '4': {
                label: '4',
            },
            '5': {
                label: '3',
            },
            '6': {
                label: '4',
            },
            '7': {
                label: '3',
            },
            '8': {
                label: '4',
            },
        },

    }
    useEffect(() => {
        setInterval(() => {
            setX(x => x + 1)
        }, 200000)
    }, [])

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
        <Header>
            <DayHeader/>
            <g transform={"translate(0 20)"}>
                <WeekHeader/>
            </g>
        </Header>
        <Events EventComponent={EventComponent}/>
        <GroupBackgrounds/>
        <GroupLabels/>
        <Now/>

    </Timeline>
}

ReactDOM.render(<App/>, document.getElementById('root'))
