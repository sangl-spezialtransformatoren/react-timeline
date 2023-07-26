import React, {useRef} from 'react'

import {TimeUnit, useIntervals} from '../../hooks/timeIntervals'
import {animated, to} from '@react-spring/web'
import {round} from '../../functions/round'
import {useCanvasHeight, useCanvasWidth, useTimePerPixel, useTimeStart} from '../Canvas/store'
import {Interval} from '../../functions/intervalFactory'
import {IntervalToMs} from '../../functions/units'


type GridProps = {
    units?: (TimeUnit& {weight?: number})[] // Units in descending interval length order
    minWidth?: number
    n?: number
}

const DefaultGridUnits: (TimeUnit& {weight?: number})[] = [
    {key: '100y', amount: 100, unit: 'years'},
    {key: '10y', amount: 10, unit: 'years'},
    {key: '1y', amount: 1, unit: 'year'},
    {key: '3M', amount: 3, unit: 'months'},
    {key: '1M', amount: 1, unit: 'month', weight: 2},
    {key: '1W', amount: 1, unit: 'week'},
    {key: '1D', amount: 1, unit: 'day'},
    {key: '4h', amount: 4, unit: 'hours'},
    {key: '1h', amount: 1, unit: 'hour'},
    {key: '15m', amount: 15, unit: 'minutes'},
    {key: '1m', amount: 1, unit: 'minute'},
    {key: '15s', amount: 15, unit: 'seconds'},
    {key: '1s', amount: 1, unit: 'second'},
    {key: '100ms', amount: 100, unit: 'milliseconds'},
    {key: '10ms', amount: 10, unit: 'milliseconds'},
    {key: '1ms', amount: 1, unit: 'milliseconds'}
]

export const Grid: React.FC<GridProps> = ({units = DefaultGridUnits, n = 250, minWidth = 35}) => {
    let timePerPixelSpring = useTimePerPixel()
    let timeStartSpring = useTimeStart()
    let canvasHeight = useCanvasHeight()

    let linePositions = useRef<number[]>([])
    useIntervals(() => ({
            units: () => units.filter(({amount, unit}) => amount * IntervalToMs[unit] / timePerPixelSpring.goal > minWidth),
            callback: (intervalMap) => {
                let timePerPixel = timePerPixelSpring.get()
                let intervals = Object.values(intervalMap).reduce<Interval[]>((acc, current) => ([...acc, ...Object.values(current.intervals)]), [])
                intervals = intervals.filter(entry => (entry.end - entry.start) / timePerPixel > minWidth)
                linePositions.current = intervals.map(entry => entry.start)
            },
            minWidth: minWidth
        }),
        [minWidth, timePerPixelSpring, units]
    )
    let dependencies = [timeStartSpring, timePerPixelSpring]
    return <g>
        {[...Array(n)].map((_, index) => {
            return <animated.line
                key={index}
                className={'non-scaling-stroke'}
                display={to(dependencies, () => linePositions.current?.[index] ? 'initial' : 'none')}
                x1={to(dependencies, (timeStart, timePerPixel) => linePositions.current?.[index] ? round((linePositions.current?.[index] - timeStart) / timePerPixel) : 0)}
                x2={to(dependencies, (timeStart, timePerPixel) => linePositions.current?.[index] ? round((linePositions.current?.[index] - timeStart) / timePerPixel) : 0)}
                y1={0}
                y2={canvasHeight.to(canvasHeight => round(canvasHeight))}
                stroke={'rgba(0, 0, 0, 0.15)'} />
        })}
    </g>
}

Grid.displayName = 'Grid'

export const WeekendMarkers: React.FC<{minWidth?: number, n?: number}> = ({minWidth = 10, n = 50}) => {
    let timePerPixelSpring = useTimePerPixel()
    let timeStartSpring = useTimeStart()
    let canvasHeight = useCanvasHeight()
    let canvasWidth = useCanvasWidth()

    let weekends = useRef<[number, number][]>([])
    useIntervals(() => ({
            units: () => {
                if (IntervalToMs['day'] / timePerPixelSpring.goal > minWidth) {
                    return [{key: '1D', amount: 1, unit: 'day'}]
                } else {
                    return []
                }
            },
            callback: (intervalMap) => {
                let intervals = Object.values(intervalMap?.[0]?.intervals || [])
                intervals = intervals.filter(x => x.isWeekend)
                intervals = intervals.filter(x => (x.end - x.start) / timePerPixelSpring.get() > minWidth)
                weekends.current = intervals.length > n ? [] : intervals.map(x => [x.start, x.end])
            },
            minWidth: minWidth
        }),
        [minWidth, n, timePerPixelSpring]
    )
    let dependencies = [timeStartSpring, timePerPixelSpring, canvasWidth, canvasHeight]

    return <g>
        {[...Array(n)].map((_, index) => {
            return <animated.rect
                key={index}
                className={'non-scaling-stroke'}
                display={to(dependencies, () => weekends.current?.[index] ? 'initial' : 'none')}
                x={to(dependencies, (timeStart, timePerPixel) => weekends.current?.[index] ? round((weekends.current?.[index][0] - timeStart) / timePerPixel) : 0)}
                width={to(dependencies, (timeStart, timePerPixel) => weekends.current?.[index] ? round((weekends.current?.[index][1] - weekends.current?.[index][0]) / timePerPixel) : 0)}
                y={0}
                height={canvasHeight.to(canvasHeight => round(canvasHeight))}
                fill={'rgb(127, 127, 127, 0.05)'} />
        })}
    </g>
}

WeekendMarkers.displayName = 'WeekendMarkers'