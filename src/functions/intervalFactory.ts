import SortedSet, {internal} from 'collections/sorted-set'
import dayjs, {Dayjs, ManipulateType} from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekday from 'dayjs/plugin/weekday'
import isoWeek from 'dayjs/plugin/isoWeek'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import {createIntervals} from './index'

import {IntervalToMs} from "./units"

dayjs.extend(weekOfYear)
dayjs.extend(weekday)
dayjs.extend(isoWeek)
dayjs.extend(advancedFormat)

const Weekend = [5, 6, 7]

export type Interval = {
    start: number,
    end: number,
    label: string,
    isWeekend: boolean
}

export function selectFromTimestampSet(timeStampSet: internal.SortedSet<Interval>, from: number, to: number): number[] {
    let v = timeStampSet.findLeastGreaterThan({start: from, end: 0, label: '', isWeekend: false})?.value
    let w = timeStampSet.findGreatestLessThan({start: to, end: 0, label: '', isWeekend: false})?.value

    if (v && w) {
        let i = timeStampSet.indexOf(v)
        let j = timeStampSet.indexOf(w)

        if (!i) {
            let min = timeStampSet.min()
            if (!min) {
                throw Error('')
            }
            i = timeStampSet.indexOf(min)
        }
        if (!j) {
            let max = timeStampSet.max()
            if (!max) {
                throw Error('')
            }
            j = timeStampSet.indexOf(max)
        }
        return timeStampSet.slice(i, j).map((x: Interval) => x.start)
    }
    throw Error('Requested values were not computed yet.')
}


export function getKeysAndTimestamps(timeStampSet: internal.SortedSet<Interval>, from: number, to: number): [number, Interval][] {
    let f = timeStampSet.findLeastGreaterThan({start: from, end: 0, label: '', isWeekend: false})?.value
    let t = timeStampSet.findGreatestLessThan({start: to, end: 0, label: '', isWeekend: false})?.value
    if (f && t) {
        let i = timeStampSet.indexOf(f)
        let j = timeStampSet.indexOf(t)
        return timeStampSet.slice(i + 1, j - 1).map((x, i) => [i, x])
    }
    throw Error('')
}

export function limitTimestampSetLength(timestampSet: internal.SortedSet<Interval>, from: number, to: number, n: number) {
    let i = 0
    let j = timestampSet.length - 1
    let p_value = timestampSet.findGreatestLessThanOrEqual({start: from, end: 0, label: '', isWeekend: false})?.value
    let q_value = timestampSet.findLeastGreaterThanOrEqual({start: to, end: 0, label: '', isWeekend: false})?.value
    let p = p_value && timestampSet.indexOf(p_value) || i
    let q = q_value && timestampSet.indexOf(q_value) || j
    if (p !== undefined && q !== undefined) {
        let n_to_delete = j + 1 - n
        let center = Math.round((p + q) / 2)
        let n_max_left = center - i
        let n_max_right = j - center
        let n_left = 0
        let n_right = 0
        if (n_max_left > n_to_delete / 2 && n_max_right > n_to_delete / 2) {
            n_left = Math.floor(n_to_delete / 2)
            n_right = Math.ceil(n_to_delete / 2)
        } else if (n_max_left < n_to_delete / 2 && n_max_right > n_to_delete / 2) {
            n_left = n_max_left
            n_right = n_to_delete - n_max_left
        } else if (n_max_left > n_to_delete / 2 && n_max_right < n_to_delete / 2) {
            n_right = n_max_right
            n_left = n_to_delete - n_max_right
        }

        timestampSet.swap(i, n_left)
        timestampSet.swap(j - n_right - n_left, n_right)
    }
}


export function updateTimestamps(timestampSet: internal.SortedSet<Interval>, from: number, to: number, n: number, interval: ManipulateType, labelFactory: (_from: Dayjs, _to: Dayjs) => string = (a, _) => a.format()) {
    let min = timestampSet.min()?.start
    let max = timestampSet.max()?.start

    if (min && max && (from < to) && (min < max) && ((from - min) / (n * IntervalToMs[interval])) < 1000 && ((to - max) / (n * IntervalToMs[interval])) < 1000) {
        if (from > max || (to > max && from < max) || (from < min && to > max)) {
            let intervals = createIntervals(dayjs(max), dayjs(to), n, interval)
            for (let [index, interval] of intervals.entries()) {
                let from = interval
                let to = intervals?.[index + 1]
                if (to) {
                    timestampSet.add({
                        start: from.valueOf(),
                        end: to.valueOf(),
                        label: labelFactory(from, to),
                        isWeekend: Weekend.includes(from.weekday()),
                    })
                }
            }
        }
        if (to < min || (from < min && to > min) || (from < min && to > max)) {
            let intervals = createIntervals(dayjs(from), dayjs(min), n, interval)
            for (let [index, interval] of intervals.entries()) {
                let from = interval
                let to = intervals?.[index + 1]
                if (to) {
                    timestampSet.add({
                        start: from.valueOf(),
                        end: to.valueOf(),
                        label: labelFactory(from, to),
                        isWeekend: Weekend.includes(from.weekday()),
                    })
                }
            }
        }
    } else {
        let intervals = createIntervals(dayjs(from), dayjs(to), n, interval)
        for (let [index, interval] of intervals.entries()) {
            let from = interval
            let to = intervals?.[index + 1]
            if (to) {
                timestampSet.add({
                    start: from.valueOf(),
                    end: to.valueOf(),
                    label: labelFactory(from, to),
                    isWeekend: Weekend.includes(from.weekday()),
                })
            }
        }
    }
}

export function createTimestampSet() {
    const timestampSet = SortedSet<Interval>()
    timestampSet.contentEquals = (a: Interval, b: Interval) => {
        return a.start === b.start
    }
    timestampSet.contentCompare = (a: Interval, b: Interval) => {
        return a.start - b.start
    }
    return timestampSet
}
