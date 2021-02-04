import {defaultMemoize} from "reselect"
import {
    addDays,
    addHours,
    addMinutes,
    addMonths,
    addQuarters,
    addWeeks,
    addYears,
    getYear,
    set,
    startOfDay,
    startOfMonth,
    startOfQuarter,
    startOfWeek,
    startOfYear
} from "date-fns"
import {shallowEqual} from "react-redux"

const memoize = defaultMemoize

function myGetStartOfDay(date: Date | number, _: string) {
    return startOfDay(date)
}

export type intervalCreatorOptions = {
    timeZone: string,
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export type IntervalCreator = (from: number | Date, to: number | Date, {}: intervalCreatorOptions) => Interval[]

export const generateMinuteIntervals = memoize((from: number | Date, to: number | Date, {}: intervalCreatorOptions) => {
    let currentMinute = set(from, {milliseconds: 0, seconds: 0})
    let minutes: Date[] = [currentMinute]
    while (currentMinute.valueOf() <= to) {
        currentMinute = addMinutes(currentMinute, 1)
        minutes = [...minutes, currentMinute]
    }
    return minutes.slice(0, -1).map<Interval>((minute, index) => ({start: minute, end: minutes.slice(1)[index]}))
}, shallowEqual)

export const generateQuarterHourIntervals = memoize((from: number | Date, to: number | Date, {}: intervalCreatorOptions) => {
    let currentQuarter = set(from, {milliseconds: 0, seconds: 0, minutes: 0})
    let hours: Date[] = [currentQuarter]
    while (currentQuarter.valueOf() <= to) {
        currentQuarter = addMinutes(currentQuarter, 15)
        hours = [...hours, currentQuarter]
    }
    return hours.slice(0, -1).map<Interval>((hour, index) => ({start: hour, end: hours.slice(1)[index]}))
}, shallowEqual)

export const generateHourIntervals = memoize((from: number | Date, to: number | Date, {}: intervalCreatorOptions) => {
    let currentHour = set(from, {milliseconds: 0, seconds: 0, minutes: 0})
    let hours: Date[] = [currentHour]
    while (currentHour.valueOf() <= to) {
        currentHour = addHours(currentHour, 1)
        hours = [...hours, currentHour]
    }
    return hours.slice(0, -1).map<Interval>((hour, index) => ({start: hour, end: hours.slice(1)[index]}))
}, shallowEqual)

export const generateFourHourIntervals = memoize((from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) => {
    let currentHour = myGetStartOfDay(from, timeZone)
    let hours: Date[] = [currentHour]
    while (currentHour.valueOf() <= to) {
        currentHour = addHours(currentHour, 4)
        hours = [...hours, currentHour]
    }
    return hours.slice(0, -1).map<Interval>((hour, index) => ({start: hour, end: hours.slice(1)[index]}))
}, shallowEqual)

export const generateDayIntervals = memoize((from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) => {
    let currentDay = myGetStartOfDay(from, timeZone)
    let days: Date[] = [currentDay]
    while (currentDay.valueOf() <= to) {
        currentDay = addDays(currentDay, 1)
        days = [...days, currentDay]
    }
    return days.slice(0, -1).map<Interval>((day, index) => ({start: day, end: days.slice(1)[index]}))
}, shallowEqual)

export const generateWeekIntervals = memoize((from: number | Date, to: number | Date, {
    timeZone,
    weekStartsOn,
}: intervalCreatorOptions) => {
    let currentWeek = myGetStartOfDay(startOfWeek(from, {weekStartsOn}), timeZone)
    let weeks: (Date | number)[] = [currentWeek]
    while (currentWeek.valueOf() <= to) {
        currentWeek = addWeeks(currentWeek, 1)
        weeks = [...weeks, currentWeek]
    }
    return weeks.slice(0, -1).map<Interval>((week, index) => ({start: week, end: weeks.slice(1)[index]}))
}, shallowEqual)

export const generateMonthIntervals = memoize((from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) => {
    let currentMonth = myGetStartOfDay(startOfMonth(from), timeZone)
    let months: (Date | number)[] = [currentMonth]
    while (currentMonth.valueOf() <= to) {
        currentMonth = addMonths(currentMonth, 1)
        months = [...months, currentMonth]
    }
    return months.slice(0, -1).map<Interval>((week, index) => ({start: week, end: months.slice(1)[index]}))
}, shallowEqual)

export const generateQuarterIntervals = memoize((from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) => {
    let currentQuarter = myGetStartOfDay(startOfQuarter(from), timeZone)
    let quarters: (Date | number)[] = [currentQuarter]
    while (currentQuarter.valueOf() <= to) {
        currentQuarter = addQuarters(currentQuarter, 1)
        quarters = [...quarters, currentQuarter]
    }
    return quarters.slice(0, -1).map<Interval>((week, index) => ({start: week, end: quarters.slice(1)[index]}))
}, shallowEqual)

export const generateYearIntervals = memoize((from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) => {
    let currentYear = myGetStartOfDay(startOfYear(from), timeZone)
    let years: (Date | number)[] = [currentYear]
    while (currentYear.valueOf() <= to) {
        currentYear = addYears(currentYear, 1)
        years = [...years, currentYear]
    }
    return years.slice(0, -1).map<Interval>((week, index) => ({start: week, end: years.slice(1)[index]}))
}, shallowEqual)

export const generateDecadeIntervals = memoize((from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) => {
    let currentDecade = myGetStartOfDay(startOfYear(set(from, {year: Math.floor(getYear(from) / 10) * 10})), timeZone)
    let decades: (Date | number)[] = [currentDecade]
    while (currentDecade.valueOf() <= to) {
        currentDecade = addYears(currentDecade, 10)
        decades = [...decades, currentDecade]
    }
    return decades.slice(0, -1).map<Interval>((week, index) => ({start: week, end: decades.slice(1)[index]}))
}, shallowEqual)

export const generateCenturyIntervals = memoize((from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) => {
    let currentCentury = myGetStartOfDay(startOfYear(set(from, {year: Math.floor(getYear(from) / 100) * 100})), timeZone)
    let century: (Date | number)[] = [currentCentury]
    while (currentCentury.valueOf() <= to) {
        currentCentury = addYears(currentCentury, 100)
        century = [...century, currentCentury]
    }
    return century.slice(0, -1).map<Interval>((week, index) => ({start: week, end: century.slice(1)[index]}))
}, shallowEqual)
