import {add, startOfDay} from 'date-fns'
import {DefaultEventShape, DefaultGroupShape} from "../definitions"
import {makePureInterval, PureInterval} from "./reducers/events"

export type BusinessLogic<Event = DefaultEventShape, _ = DefaultGroupShape> = {
    mapEventsToIntervals: (events: Record<string, Event>) => Record<string, PureInterval>
    mapEventsToGroups: (events: Record<string, Event>) => Record<string, string>
    validateDuringDrag: (data: { id: string, newInterval: Interval }) => { interval?: Interval }
    validateDuringResize: (data: { id: string, newInterval: Interval }) => { interval?: Interval }
    validateAfterDrag: (data: { id: string, newInterval: Interval }) => { interval?: Interval }
    validateAfterResize: (data: { id: string, newInterval: Interval }) => { interval?: Interval }
    orderGroups: (data: { groupIds: string[] }) => { groupIds: string[] }
}

export const DefaultBusinessLogic: BusinessLogic = {
    mapEventsToIntervals: (events) => {
        return Object.fromEntries(Object.entries(events).map(([eventId, event]) => [eventId, makePureInterval(event.interval)]))
    },
    mapEventsToGroups: (events) => {
        return Object.fromEntries(Object.entries(events).map(([eventId, event]) => [eventId, event.groupId]))
    },
    validateDuringDrag: ({newInterval}) => ({
        interval: {
            start: startOfDay(newInterval.start),
            end: startOfDay(newInterval.end),
        },
    }),
    validateDuringResize: ({newInterval}) => ({
        interval: {
            start: startOfDay(add(newInterval.start, {hours: 12})),
            end: startOfDay(add(newInterval.end, {hours: 12})),
        },
    }),
    validateAfterDrag: ({newInterval}) => ({
        interval: {
            start: startOfDay(newInterval.start),
            end: startOfDay(newInterval.end),
        },
    }),
    validateAfterResize: ({newInterval}) => ({
        interval: {
            start: startOfDay(newInterval.start),
            end: startOfDay(newInterval.end),
        },
    }),
    orderGroups: ({groupIds}) => ({
        groupIds: groupIds.sort()
    })
}