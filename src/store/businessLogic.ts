import {startOfDay} from 'date-fns'

export type BusinessLogic = {
    validateDuringDrag: (data: {id: string, newInterval: Interval}) => {interval?: Interval}
}

export const DefaultConfig: BusinessLogic = {
    validateDuringDrag: ({newInterval}) => ({
        interval: {
            start: startOfDay(newInterval.start),
            end: startOfDay(newInterval.end),
        },
    }),
}