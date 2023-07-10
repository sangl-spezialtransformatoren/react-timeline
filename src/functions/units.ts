import {ManipulateType} from "dayjs"

let year = 365 * 24 * 60 * 60 * 1000
let ms = 1
let second = 1000
let minute = 60 * 1000
let hour = 60 * 60 * 1000
let day = 24 * 60 * 60 * 1000
let week = 7 * 24 * 60 * 60 * 1000
let month = 30 * 24 * 60 * 60 * 1000
export const IntervalToMs: { [_ in ManipulateType]: number } = {
    millisecond: ms,
    second: second,
    minute: minute,
    hour: hour,
    day: day,
    month: month,
    year: year,
    milliseconds: ms,
    seconds: second,
    minutes: minute,
    hours: hour,
    days: day,
    months: month,
    years: year,
    d: day,
    D: day,
    M: month,
    y: year,
    h: hour,
    m: minute,
    s: second,
    ms: ms,
    week: week,
    weeks: week,
    w: week
}

export function getParentUnit(unit: ManipulateType): [ManipulateType, number] {
    switch (unit) {
        case 'year':
        case 'years': {
            return ['years', 1]
        }
        case 'month':
        case 'months': {
            return ['years', 12]
        }
        case 'week':
        case 'weeks': {
            return ['years', 52]
        }
        case 'd':
        case 'D':
        case 'day':
        case 'days': {
            throw Error(`Can't create grid of days as months hava different amounts of days.`)
        }
        case 'h':
        case 'hours':
        case 'hour': {
            return ['day', 24]
        }
        case 'm':
        case 'minute':
        case 'minutes': {
            return ['hour', 60]
        }
        case 's':
        case 'second':
        case 'seconds': {
            return ['minute', 60]
        }
        case 'ms':
        case 'millisecond':
        case 'milliseconds': {
            return ['second', 1000]
        }
        default: {
            throw Error('Not implemented.')
        }
    }
}

