import React from 'react'
import {useTimePerPixelSpring} from '../context'
import {useDateZero, useGetHeaderIntervals} from '../store/hooks'
import {animated, to} from '@react-spring/web'
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
} from '../functions/intervals'

type GridProps<T = {}> = {x: number, y: number, width: number, height: number} & T
type TemporalGridProps = GridProps<{date: Date | number}>
export type GridComponent<T> = React.FC<T & {x: number, width: number, height: number}>
export type TemporalGridComponent<T = {}> = React.FC<TemporalGridProps & T>

export function createGridElement<T>(component: GridComponent<T>) {
    let AnimatedGrid = animated(component)

    let GridElement: React.FC<{start: Date | number, end: Date | number} & T> = (props) => {
        let {start, end, children, ...otherProps} = props
        let timePerPixelSpring = useTimePerPixelSpring()
        let dateZero = useDateZero()

        let x = to([timePerPixelSpring], (timePerPixel) => ((start.valueOf() - dateZero.valueOf()) / (timePerPixel as number)))
        let y = 0
        let width = to([timePerPixelSpring], (timePerPixel) => (end.valueOf() - start.valueOf()) / (timePerPixel as number))
        let height = 1000

        // @ts-ignore
        return <AnimatedGrid x={x} y={y} width={width} height={height} {...(otherProps as unknown as T)} />
    }
    return React.memo(GridElement)
}

export function createTemporalGrid<T>(component: GridComponent<T>, intervalName: string, intervalCreator: (from: Date | number, to: Date | number, options: intervalCreatorOptions) => Interval[], intervalLength: number) {
    let GridElement = createGridElement(component)

    let TemporalGrid: React.FC<Omit<T, keyof TemporalGridProps>> = (props) => {
        let {children, ...otherProps} = props
        let intervals = useGetHeaderIntervals(intervalCreator, intervalLength)
        return <>
            {intervals.map((interval) => {
                return <GridElement
                    key={intervalName + new Date(interval.start).toISOString()}
                    start={interval.start.valueOf()}
                    end={interval.end.valueOf()}
                    date={interval.start.valueOf()}
                    {...(otherProps as unknown as T)} />
            })}
        </>
    }
    return React.memo(TemporalGrid)
}

export function createMinuteGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'minute', generateMinuteIntervals, 60 * 1000)
}

export function createQuarterHourGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'quarter-hour', generateQuarterHourIntervals, 15 * 60 * 1000)
}

export function createHourGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'hour', generateHourIntervals, 60 * 60 * 1000)
}

export function createFourHourGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'four-hours', generateFourHourIntervals, 4 * 605 * 60 * 1000)
}

export function createDayGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'day', generateDayIntervals, 24 * 60 * 60 * 1000)
}

export function createWeekGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'week', generateWeekIntervals, 7 * 24 * 60 * 60 * 1000)
}

export function createMonthGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'month', generateMonthIntervals, 30 * 24 * 60 * 60 * 1000)
}

export function createQuarterGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'quarter', generateQuarterIntervals, 90 * 24 * 60 * 60 * 1000)
}

export function createYearGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'year', generateYearIntervals, 365 * 24 * 60 * 60 * 1000)
}

export function createDecadeGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'decade', generateDecadeIntervals, 10 * 365 * 24 * 60 * 60 * 1000)
}

export function createCenturyGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'century', generateCenturyIntervals, 100 * 365 * 24 * 60 * 60 * 1000)
}
