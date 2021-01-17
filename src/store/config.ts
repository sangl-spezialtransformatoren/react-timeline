import {startOfDay} from 'date-fns'

export type TimeLineStateConfig = {
    validateDuringDrag: (data: {id: string, newInterval: Interval}) => {interval?: Interval}
}

export const DefaultConfig: TimeLineStateConfig = {
    validateDuringDrag: ({newInterval}) => ({
        interval: {
            start: startOfDay(newInterval.start),
            end: startOfDay(newInterval.end),
        },
    }),
}