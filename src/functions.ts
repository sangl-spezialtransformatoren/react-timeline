import {getDefaultTimeZone} from "./index"
import {add, addHours, startOfWeek} from "date-fns"
import {format, zonedTimeToUtc} from "date-fns-tz"

function getStartOfDay(date: Date | number, timeZone: string = getDefaultTimeZone()) {
    let dayString = format(date, "yyyy-MM-dd", {timeZone: timeZone}) + "T00:00:000"
    return zonedTimeToUtc(dayString, timeZone)
}

export function generateDayIntervals(from: number | Date, to: number | Date, timeZone: string = getDefaultTimeZone()) {
    let currentDay = getStartOfDay(from, timeZone)
    let days: Date[] = [currentDay]
    while (currentDay.valueOf() <= to) {
        currentDay = getStartOfDay(addHours(currentDay, 36), timeZone)
        days = [...days, currentDay]
    }
    return days.slice(0, -1).map<Interval>((day, index) => ({start: day, end: days.slice(1)[index]}))
}

export function generateWeekIntervals(from: number | Date, to: number | Date, timeZone: string = getDefaultTimeZone(), weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1) {
    let currentWeek = getStartOfDay(startOfWeek(from, {weekStartsOn}), timeZone)
    let weeks: (Date | number)[] = [currentWeek]
    while (currentWeek.valueOf() <= to) {
        currentWeek = getStartOfDay(add(currentWeek, {days: 7, hours: 12}), timeZone)
        weeks = [...weeks, currentWeek]
    }
    return weeks.slice(0, -1).map<Interval>((week, index) => ({start: week, end: weeks.slice(1)[index]}))
}