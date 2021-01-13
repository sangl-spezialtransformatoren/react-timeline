import React, {useContext, useEffect, useState} from "react"
import {TimelineContext} from "./definitions"
import {
    generateDayIntervals,
    generateHourIntervals,
    generateMinuteIntervals,
    generateMonthIntervals,
    generateQuarterHourIntervals,
    generateWeekIntervals,
    intervalCreatorOptions
} from "./functions"
import {animated, to} from "react-spring"
import {getDefaultTimeZone} from "./index"

type HeaderProps<T = {}> = { x: number, y: number, width: number, height: number } & T
type TemporalHeaderProps = HeaderProps<{ date: Date | number }>

export type HeaderComponent<T> = React.FC<T & { x: number, y: number, width: number, height: number }>
export type TemporalHeaderComponent<T = {}> = React.FC<TemporalHeaderProps & T>

function createHeaderElement<T>(component: HeaderComponent<T>) {
    let HeaderElement: React.FC<{ interval: Interval } & T> = (props) => {
        let {interval, children, ...otherProps} = props
        let {timePerPixelSpring, dateZero} = useContext(TimelineContext)

        let x = to([timePerPixelSpring], (timePerPixel) => ((interval.start.valueOf() - dateZero.valueOf()) / timePerPixel.valueOf()))
        let y = 0
        let width = to([timePerPixelSpring], (timePerPixel) => (interval.end.valueOf() - interval.start.valueOf()) / timePerPixel)
        let height = 20

        let AnimatedHeader = animated(component)
        // @ts-ignore
        return <AnimatedHeader x={x} y={y} width={width} height={height} {...(otherProps as unknown as T)}/>
    }
    return HeaderElement
}

export function createTemporalHeader<T>(component: HeaderComponent<T>, intervalName: string, intervalCreator: (from: Date | number, to: Date | number, options: intervalCreatorOptions) => Interval[]): React.FC<{ timeZone?: string, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 } & Omit<T, keyof TemporalHeaderProps>> {
    let HeaderElement = createHeaderElement(component)
    return (props) => {
        let {timeZone, children, weekStartsOn, ...otherProps} = props
        let {startDate, endDate} = useContext(TimelineContext)
        let [intervals, setIntervals] = useState<Interval[]>([])

        useEffect(() => {
            let temporalWidth = (endDate.valueOf() - startDate.valueOf())
            let from = startDate.valueOf() - 0.3 * temporalWidth
            let to = endDate.valueOf() + 0.3 * temporalWidth
            setIntervals(intervalCreator(from, to, {
                timeZone: timeZone || getDefaultTimeZone(),
                weekStartsOn: weekStartsOn || 1
            }))
        }, [startDate, endDate])

        return <g>
            {intervals.map((interval) => {
                return <HeaderElement
                    key={intervalName + new Date(interval.start).toISOString()}
                    interval={interval}
                    date={interval.start}
                    {...(otherProps as unknown as T)}/>
            })}
        </g>
    }
}

export function createMinuteHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, "minute", generateMinuteIntervals)
}

export function createQuarterHourHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, "quarter-hour", generateQuarterHourIntervals)
}

export function createHourHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, "hour", generateHourIntervals)
}

export function createDayHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, "day", generateDayIntervals)
}

export function createWeekHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, "week", generateWeekIntervals)
}

export function createMonthHeader<T>(component: TemporalHeaderComponent<T>) {
    return createTemporalHeader(component, "month", generateMonthIntervals)
}

