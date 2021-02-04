import {BusinessLogic, DefaultBusinessLogic, makePureInterval} from "react-timeline"
import {EventData, GroupData} from "./data"
import {addDays, addHours, startOfDay} from "date-fns"

export const businessLogic: BusinessLogic<EventData, GroupData, EventData, GroupData> = {
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