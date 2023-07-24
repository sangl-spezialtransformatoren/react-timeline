import React, {useCallback, useRef} from 'react'
import {ManipulateType} from 'dayjs'

import {defaultUnits, useIntervalCallback} from '../../hooks/timeIntervals'
import {animated, to} from '@react-spring/web'
import {round} from '../../functions/round'
import {useCanvasHeight, useTimePerPixel, useTimeStart} from '../Canvas/store'
import {Interval} from "../../functions/intervalFactory"


type GridProps = {
    units?: [number, ManipulateType][]
    minWidth?: number
    n?: number
}


export const Grid: React.FC<GridProps> = ({units = defaultUnits, n = 300, minWidth = 30}) => {
    let timePerPixelSpring = useTimePerPixel()
    let timeStartSpring = useTimeStart()
    let canvasHeight = useCanvasHeight()

    let linePositions = useRef<number[]>([])
    let onIntervalsChange = useCallback((intervals: [number, Interval][][]) => {
        let timePerPixel = timePerPixelSpring.goal
        let filteredResults = intervals?.map(entry => entry?.filter(x => (x[1].end - x[1].start) / timePerPixel > minWidth))
        let beginnings = filteredResults?.map(entry => entry?.map(x => x[1].start))
        linePositions.current = beginnings.reduce((cumulated, next) => [...cumulated, ...next], [])
    }, [minWidth, timePerPixelSpring])

    useIntervalCallback(onIntervalsChange, units, minWidth)


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
                stroke={'rgba(0, 0, 0, 0.2)'}/>
        })}
    </g>
}

Grid.displayName = 'Grid'