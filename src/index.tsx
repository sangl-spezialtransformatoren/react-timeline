export {Timeline, useTimelineState} from './timeline'
export {Grid} from './grid'
export {DefaultTimelineState} from './defaults'
export {
    TimelineState,
    TimelineData,
    TimelineProps,
    TimelineContextShape,
    TimelineContext,
    TimelineEvent,
    TimelineStyle,
    InitialTimelineParameters
} from './definitions'
export {TimeRect} from './blocks'
export {DayHeader, WeekHeader} from "./headers"
let defaultTimeZone = "Etc/UTC"

export function setDefaultTimezone(timeZone: string) {
    defaultTimeZone = timeZone
}

export function getDefaultTimeZone() {
    return defaultTimeZone
}