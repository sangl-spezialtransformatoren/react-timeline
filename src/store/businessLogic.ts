import {add, compareAsc, startOfDay} from 'date-fns'
import {RequiredEventData, RequiredGroupData} from './shape'

export type BusinessLogic<E extends RequiredEventData = RequiredEventData, _G extends RequiredGroupData = RequiredGroupData, EventProps extends {} = {}> = {
    validateDuringDrag: (data: { id: string, newInterval: Interval }) => { interval?: Interval }
    validateDuringResize: (data: { id: string, newInterval: Interval }) => { interval?: Interval }
    validateAfterDrag: (data: { id: string, newInterval: Interval }) => Promise<{ interval?: Interval }>
    validateAfterResize: (data: { id: string, newInterval: Interval }) => Promise<{ interval?: Interval }>
    orderGroups: (data: { groupIds: string[] }) => { groupIds: string[] },
    orderEventsForPositioning: (data: Record<string, E>) => string[],
    mapEventsToLayer: (data: Record<string, E>) => Record<string, number>,
    mapEventsToProps: (data: Record<string, E>) => Record<string, EventProps>
    displayEventsInSameRow: (data: Record<string, E>) => string[][]
}

export const DefaultBusinessLogic: BusinessLogic = {
    validateDuringDrag: ({newInterval}) => ({
        interval: {
            start: startOfDay(add(newInterval.start, {hours: 12})),
            end: startOfDay(add(newInterval.end, {hours: 12})),
        },
    }),
    validateDuringResize: ({newInterval}) => ({
        interval: {
            start: startOfDay(add(newInterval.start, {hours: 12})),
            end: startOfDay(add(newInterval.end, {hours: 12})),
        },
    }),
    validateAfterDrag: async ({newInterval}) => {
        return {
            interval: {
                start: startOfDay(add(newInterval.start, {hours: 12})),
                end: startOfDay(add(newInterval.end, {hours: 12})),
            },
        }
    },
    validateAfterResize: async ({newInterval}) => {
        return {
            interval: {
                start: startOfDay(add(newInterval.start, {hours: 12})),
                end: startOfDay(add(newInterval.end, {hours: 12})),
            },
        }
    },
    orderGroups: ({groupIds}) => ({
        groupIds: groupIds.sort(),
    }),
    orderEventsForPositioning: data => {
        return Object.entries(data).sort(([_a, EventA], [_b, EventB]) => compareAsc(EventA.interval.start, EventB.interval.start)).map(([eventId]) => eventId)
    },
    mapEventsToLayer: data => {
        return Object.fromEntries(Object.keys(data).map((key, _) => [key, 0])) as Record<string, number>
    },
    mapEventsToProps: data => data,
    displayEventsInSameRow: _ => []
}
