export {Timeline, useTimelineState} from './timeline'
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
export {createDayHeader, createWeekHeader} from "./headers"
let defaultTimeZone = "Etc/UTC"

export function setDefaultTimezone(timeZone: string) {
    defaultTimeZone = timeZone
}

export function getDefaultTimeZone() {
    return defaultTimeZone
}

export {
    MinuteHeader,
    QuarterHourHeader,
    HourHeader,
    DayHeader,
    WeekHeader,
    MonthHeader,
    QuarterHeader,
    YearHeader,
    DecadeHeader,
    CenturyHeader,
    AutomaticHeader
} from "./presentational"
