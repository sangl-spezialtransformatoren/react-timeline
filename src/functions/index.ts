import {Dayjs, OpUnitType} from 'dayjs'

export function getParentUnit(unit: OpUnitType): [OpUnitType, number] {
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
        case 'date':
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

export function getStart(date: Dayjs, n: number, interval: OpUnitType) {
    if (n === 1) {
        if (interval === 'week' || interval === 'weeks') {
            return date.startOf('isoWeek')
        }
        return date.startOf(interval)
    } else {
        switch (interval) {
            case 'year':
            case 'years': {
                if (n % 1 !== 0) {
                    throw Error(`Can only create a grid from an integer period of years.`)
                }
                date = date.startOf('year')
                return date.set('year', Math.floor(date.year() / n) * n)
            }
            case 'month':
            case 'months': {
                if (12 % n !== 0) {
                    throw Error(`Can't divide a year into ${n} month parts.`)
                } else {
                    return date.startOf('year')
                }
            }
            case 'week':
            case 'weeks': {
                if (52 % n !== 0) {
                    throw Error(`Can't divide a year into ${n} week parts.`)
                } else {
                    return date.startOf('week')
                }
            }
            case 'd':
            case 'date':
            case 'day':
            case 'days': {
                throw Error(`Can't create grid of ${n} days as months hava different amounts of days.`)
            }
            case 'h':
            case 'hours':
            case 'hour': {
                if (24 % n !== 0) {
                    throw Error(`Can't divide a day into ${n} hour parts.`)
                } else {
                    return date.startOf('day')
                }
            }
            case 'm':
            case 'minute':
            case 'minutes': {
                if (60 % n !== 0) {
                    throw Error(`Can't divide an hour into ${n} minute parts.`)
                } else {
                    return date.startOf('hour')
                }
            }
            case 's':
            case 'second':
            case 'seconds': {
                if (60 % n !== 0) {
                    throw Error(`Can't divide a minute into ${n} second parts.`)
                } else {
                    return date.startOf('minute')
                }
            }
            case 'ms':
            case 'millisecond':
            case 'milliseconds': {
                if (1000 % n !== 0) {
                    throw Error(`Can't divide a second into ${n} millisecond parts.`)
                } else {
                    return date.startOf('second')
                }
            }
            default: {
                throw Error('Not implemented.')
            }
        }
    }
}

export const createIntervals = (from: Dayjs, to: Dayjs, n: number, interval: OpUnitType) => {
    const start = getStart(from, n, interval)
    let result: Dayjs[] = []
    let i = 0

    let parentInterval: OpUnitType | undefined = undefined
    let amountInParent: number | undefined = undefined

    if (n != 1) {
        [parentInterval, amountInParent] = getParentUnit(interval)
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
        let newDates: Dayjs[] = []
        if (n === 1 || parentInterval === interval) {
            newDates.push(start.add(i * n, interval))
        } else {
            if (parentInterval && amountInParent) {
                for (let j = 0; j <= Math.ceil(amountInParent / n) - 1; j++) {
                    let entry = start.add(i, parentInterval).add(j * n, interval)
                    newDates.push(entry)
                }
            } else {
                throw Error()
            }
        }
        result.push(...newDates)
        if (newDates.slice(-1)[0] > to) {
            break
        }
        i++
    }
    return result.filter(x => x >= from && x <= to)
}