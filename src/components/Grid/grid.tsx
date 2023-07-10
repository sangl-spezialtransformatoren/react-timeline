import React, {useEffect, useRef} from 'react'
import {ManipulateType} from 'dayjs'

import {useIntervalCalculator} from '../../hooks/timeIntervals'
import {animated, to} from '@react-spring/web'
import {round} from '../../functions/round'
import {
    useCanvasHeight,
    useCanvasStore,
    useCanvasStoreApi, useCanvasWidth,
    useTimePerPixel,
    useTimeStart
} from '../Canvas/store'

import {useAnimationFrame} from "../../hooks/animationFrame"
import {IntervalToMs} from "../../functions/units"


function logRound(value: number, base = 2) {
    return base ** (Math.round(Math.log(value) / Math.log(base)))
}

function roundTo(value: number, size: number) {
    return size * Math.round(value / size)
}

const base = 1.2
const factor = 0.7

type NewGridProps = {
    units?: [number, ManipulateType][]
    minWidth?: number
    n?: number
}


const defaultUnits: [number, ManipulateType][] = [
    [100, 'years'],
    [10, 'years'],
    [1, 'year'],
    [3, 'months'],
    [1, 'month'],
    [1, 'week'],
    [1, 'day'],
    [4, 'hours'],
    [1, 'hour'],
    [15, 'minutes'],
    [1, 'minute'],
    [15, 'seconds'],
    [1, 'second'],
    [100, 'milliseconds'],
    [10, 'milliseconds'],
    [1, 'milliseconds']
]

export const Grid: React.FC<NewGridProps> = ({units = defaultUnits, n = 150, minWidth = 20}) => {
    let {createIntervals} = useIntervalCalculator()
    let timeStartSpring = useTimeStart()
    let timePerPixelSpring = useTimePerPixel()
    let canvasWidthSpring = useCanvasWidth()
    let canvasHeight = useCanvasHeight()

    let timeFrom = useRef(0)
    let timeTo = useRef(0)

    let linePositions = useRef<number[]>([])
    useAnimationFrame(async () => {
        let timeStart = timeStartSpring.get()
        let timePerPixel = timePerPixelSpring.get()
        let canvasWidth = canvasWidthSpring.get()

        let timeEnd = timeStart + timePerPixel * canvasWidth
        let timeWidth = timeEnd - timeStart

        const quantization = logRound(timeWidth, base)
        const roundedTimeStart = roundTo(timeStart, quantization)
        const roundedTimeEnd = roundTo(timeEnd, quantization)

        let newFrom = roundedTimeStart - factor * quantization
        let newTo = roundedTimeEnd + factor * quantization

        if (timeFrom.current !== newFrom || timeTo.current !== newTo) {
            timeFrom.current = newFrom
            timeTo.current = newTo

            let unitsToCalculate = units.filter(([amount, unit]) => amount * IntervalToMs[unit] / timePerPixel > minWidth)
            let lowerBound = newFrom - (newTo - newFrom)
            let upperBound = newTo + (newTo - newFrom)
            let results = await Promise.all(unitsToCalculate.map(async ([amount, unit]) => await createIntervals(lowerBound, upperBound, amount, unit)))
            results = results.filter(x => !!x)
            let filteredResults = results?.map(entry => entry?.filter(x => (x[1].end - x[1].start) / timePerPixel > minWidth))
            let beginnings = filteredResults?.map(entry => entry?.map(x => x[1].start))
            linePositions.current = beginnings.reduce((cumulated, next) => [...cumulated, ...next], []).sort((a, b) => Math.abs(a - (newFrom + newTo) / 2) - Math.abs(b - (newFrom + newTo) / 2))
        }
    })


    return <g>
        {[...Array(n)].map((_, index) => {
            return <animated.line
                key={index}
                className={'non-scaling-stroke'}
                display={to(timeStartSpring, timeStart => linePositions.current?.[index] ? 'initial' : 'none')}
                x1={to(([timeStartSpring, timePerPixelSpring]), (timeStart, timePerPixel) => linePositions.current?.[index] ? round((linePositions.current?.[index] - timeStart) / timePerPixel) : 0)}
                x2={to(([timeStartSpring, timePerPixelSpring]), (timeStart, timePerPixel) => linePositions.current?.[index] ? round((linePositions.current?.[index] - timeStart) / timePerPixel) : 0)}
                y1={0}
                y2={canvasHeight.to(canvasHeight => round(canvasHeight))}
                stroke={'rgba(0, 0, 0, 0.2)'} />
        })}
    </g>
}

Grid.displayName = 'Grid'