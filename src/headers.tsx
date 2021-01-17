import React, {useEffect, useState} from 'react'
import {
    generateCenturyIntervals,
    generateDayIntervals,
    generateDecadeIntervals,
    generateFourHourIntervals,
    generateHourIntervals,
    generateMinuteIntervals,
    generateMonthIntervals,
    generateQuarterHourIntervals,
    generateQuarterIntervals,
    generateWeekIntervals,
    generateYearIntervals,
    intervalCreatorOptions,
} from './functions'
import {animated, to} from 'react-spring'
import {getDefaultTimeZone} from './index'
import {useTimePerPixelSpring} from './context'
import {useDateZero, useEndDate, useStartDate, useTimeZone, useWeekStartsOn} from './store/selectors'

type HeaderProps<T = {}> = {x: number, y: number, width: number, height: number} & T
type TemporalHeaderProps = HeaderProps<{date: Date | number}>

export type HeaderComponent<T> = React.FC<T & {x: number, y: number, width: number, height: number}>
export type TemporalHeaderComponent<T = {}> = React.FC<TemporalHeaderProps & T>

function createHeaderElement<T>(component: HeaderComponent<T>) {
    let HeaderElement: React.FC<{start: Date | number, end: Date | number} & T> = (props) => {
        let {start, end, children, ...otherProps} = props
        let timePerPixelSpring = useTimePerPixelSpring()
        let dateZero = useDateZero()

        let x = to([timePerPixelSpring], (timePerPixel) => ((start.valueOf() - dateZero.valueOf()) / timePerPixel.valueOf()))
        let y = 0
        let width = to([timePerPixelSpring], (timePerPixel) => (end.valueOf() - start.valueOf()) / timePerPixel)
        let height = 20

        let AnimatedHeader = animated(component)
        // @ts-ignore
        return <AnimatedHeader x={x} y={y} width={width} height={height} {...(otherProps as unknown as T)} />
    }
    return React.memo(HeaderElement)
}

export function createTemporalHeader<T>(component: HeaderComponent<T>, intervalName: string, intervalCreator: (from: Date | number, to: Date | number, options: intervalCreatorOptions) => Interval[], intervalLength: number) {
    let HeaderElement = createHeaderElement(component)
    let TemporalHeader: React.FC<Omit<T, keyof TemporalHeaderProps>> = (props) => {
        let {children, ...otherProps} = props

        let startDate = useStartDate()
        let endDate = useEndDate()
        let timeZone = useTimeZone()
        let weekStartsOn = useWeekStartsOn()

        let [intervals, setIntervals] = useState<Interval[]>([])

        useEffect(() => {
            let temporalWidth = (endDate.valueOf() - startDate.valueOf())
            let from = Math.floor((startDate.valueOf() - temporalWidth) / intervalLength) * intervalLength
            let to = Math.ceil((endDate.valueOf() + temporalWidth) / intervalLength) * intervalLength
            setIntervals(intervalCreator(from, to, {
                timeZone: timeZone || getDefaultTimeZone(),
                weekStartsOn: weekStartsOn || 1,
            }))
        }, [startDate, endDate])

        return <>
            {intervals.map((interval) => {
                return <HeaderElement
                    key={intervalName + new Date(interval.start).toISOString()}
                    start={interval.start.valueOf()}
                    end={interval.end.valueOf()}
                    date={interval.start.valueOf()}
                    {...(otherProps as unknown as T)} />
            })}
        </>
    }
    return TemporalHeader
}

export function createMinuteHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'minute', generateMinuteIntervals, 60 * 1000)
}

export function createQuarterHourHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'quarter-hour', generateQuarterHourIntervals, 15 * 60 * 1000)
}

export function createHourHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'hour', generateHourIntervals, 60 * 60 * 1000)
}

export function createFourHourHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'four-hours', generateFourHourIntervals, 4 * 605 * 60 * 1000)
}

export function createDayHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'day', generateDayIntervals, 24 * 60 * 60 * 1000)
}

export function createWeekHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'week', generateWeekIntervals, 7 * 24 * 60 * 60 * 1000)
}

export function createMonthHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'month', generateMonthIntervals, 30 * 24 * 60 * 60 * 1000)
}

export function createQuarterHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'quarter', generateQuarterIntervals, 90 * 24 * 60 * 60 * 1000)
}

export function createYearHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'year', generateYearIntervals, 365 * 24 * 60 * 60 * 1000)
}

export function createDecadeHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'decade', generateDecadeIntervals, 10 * 365 * 24 * 60 * 60 * 1000)
}

export function createCenturyHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, 'century', generateCenturyIntervals, 100 * 365 * 24 * 60 * 60 * 1000)
}

