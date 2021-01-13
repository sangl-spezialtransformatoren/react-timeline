import {getDefaultTimeZone} from "./index"
import {add, addHours, addMinutes, startOfMonth, startOfWeek} from "date-fns"
import {format, zonedTimeToUtc} from "date-fns-tz"

function getStartOfDay(date: Date | number, timeZone: string = getDefaultTimeZone()) {
    let dayString = format(new Date(date), "yyyy-MM-dd", {timeZone: timeZone}) + "T00:00:000"
    return zonedTimeToUtc(dayString, timeZone)
}

function getStartOfHour(date: Date | number, timeZone: string = getDefaultTimeZone()) {
    let timeString = format(new Date(date), "yyyy-MM-dd") + "T" + format(new Date(date), "HH", {timeZone: timeZone}) + ":00:00.000"
    return zonedTimeToUtc(timeString, timeZone)
}

function getStartOfMinute(date: Date | number, timeZone: string = getDefaultTimeZone()) {
    let timeString = format(new Date(date), "yyyy-MM-dd") + "T" + format(new Date(date), "HH", {timeZone: timeZone}) + ":00:00.000"
    return zonedTimeToUtc(timeString, timeZone)
}

export type intervalCreatorOptions = {
    timeZone: string,
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export function generateMinuteIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentMinute = getStartOfMinute(from, timeZone)
    let minutes: Date[] = [currentMinute]
    while (currentMinute.valueOf() <= to) {
        currentMinute = addMinutes(currentMinute, 1)
        minutes = [...minutes, currentMinute]
    }
    return minutes.slice(0, -1).map<Interval>((minute, index) => ({start: minute, end: minutes.slice(1)[index]}))
}

export function generateQuarterHourIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentQuarter = getStartOfHour(from, timeZone)
    let hours: Date[] = [currentQuarter]
    while (currentQuarter.valueOf() <= to) {
        currentQuarter = addMinutes(currentQuarter, 15)
        hours = [...hours, currentQuarter]
    }
    return hours.slice(0, -1).map<Interval>((hour, index) => ({start: hour, end: hours.slice(1)[index]}))
}

export function generateHourIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentHour = getStartOfHour(from, timeZone)
    let hours: Date[] = [currentHour]
    while (currentHour.valueOf() <= to) {
        currentHour = addHours(currentHour, 1)
        hours = [...hours, currentHour]
    }
    return hours.slice(0, -1).map<Interval>((hour, index) => ({start: hour, end: hours.slice(1)[index]}))
}

export function generateDayIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentDay = getStartOfDay(from, timeZone)
    let days: Date[] = [currentDay]
    while (currentDay.valueOf() <= to) {
        currentDay = getStartOfDay(addHours(currentDay, 36), timeZone)
        days = [...days, currentDay]
    }
    return days.slice(0, -1).map<Interval>((day, index) => ({start: day, end: days.slice(1)[index]}))
}

export function generateWeekIntervals(from: number | Date, to: number | Date, {
    timeZone,
    weekStartsOn
}: intervalCreatorOptions) {
    let currentWeek = getStartOfDay(startOfWeek(from, {weekStartsOn}), timeZone)
    let weeks: (Date | number)[] = [currentWeek]
    while (currentWeek.valueOf() <= to) {
        currentWeek = getStartOfDay(add(currentWeek, {days: 7, hours: 12}), timeZone)
        weeks = [...weeks, currentWeek]
    }
    return weeks.slice(0, -1).map<Interval>((week, index) => ({start: week, end: weeks.slice(1)[index]}))
}

export function generateMonthIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentMonth = getStartOfDay(startOfMonth(from), timeZone)
    let months: (Date | number)[] = [currentMonth]
    while (currentMonth.valueOf() <= to) {
        currentMonth = getStartOfDay(add(currentMonth, {months: 1}), timeZone)
        months = [...months, currentMonth]
    }
    return months.slice(0, -1).map<Interval>((week, index) => ({start: week, end: months.slice(1)[index]}))
}