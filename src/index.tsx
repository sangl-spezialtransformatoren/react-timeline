export {Timeline} from './timeline'
export {
    TimelineProps,
    TimelineContextShape,
    TimelineContext,
    TimelineStyle,
    InitialTimelineParameters,
} from './definitions'
export {createDayHeader, createWeekHeader} from './headers'
let defaultTimeZone = 'Etc/UTC'

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
    AutomaticHeader,
} from './presentational'
