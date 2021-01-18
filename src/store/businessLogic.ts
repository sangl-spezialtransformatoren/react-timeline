import {add, startOfDay} from 'date-fns'

export type BusinessLogic = {
    validateDuringDrag: (data: { id: string, newInterval: Interval }) => { interval?: Interval }
    validateDuringResize: (data: { id: string, newInterval: Interval }) => { interval?: Interval }
    validateAfterDrag: (data: { id: string, newInterval: Interval }) => { interval?: Interval }
    validateAfterResize: (data: { id: string, newInterval: Interval }) => { interval?: Interval }
}

export const DefaultConfig: BusinessLogic = {
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
}