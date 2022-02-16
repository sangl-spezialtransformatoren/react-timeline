import {OpUnitType} from 'dayjs'

let ms = 1
let second = 1000
let minute = 60 * 1000
let hour = 60 * 60 * 1000
let day = 24 * 60 * 60 * 1000
let week = 7 * 24 * 60 * 60 * 1000
let month = 30 * 24 * 60 * 60 * 1000
let year = 365 * 24 * 60 * 60 * 1000

export const IntervalToMs: { [_ in OpUnitType]: number } = {
    millisecond: ms,
    second: second,
    minute: minute,
    hour: hour,
    day: day,
    month: month,
    year: year,
    date: day,
    milliseconds: ms,
    seconds: second,
    minutes: minute,
    hours: hour,
    days: day,
    months: month,
    years: year,
    dates: day,
    d: day,
    M: month,
    y: year,
    h: hour,
    m: minute,
    s: second,
    ms: ms,
    week: week,
    weeks: week,
    w: week,
}
