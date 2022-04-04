import React, {useMemo} from 'react'
import {OpUnitType} from 'dayjs'

import {useIntervals} from '../../hooks/timeIntervals'
import {IntervalToMs} from '../../units'
import {useCanvasHeight, useTimelyTransform, useTimePerPixelAnchor, useTimeZero} from "../canvas/canvasStore"
import {animated} from '@react-spring/web'
import {round} from "../../functions/round"

export const Lines: React.FC<{amount: number, unit: OpUnitType}> = React.memo(
    ({
         amount,
         unit,
     }) => {
        const timeZero = useTimeZero()
        const timePerPixelAnchor = useTimePerPixelAnchor()
        const canvasHeight = useCanvasHeight()

        let intervals = useIntervals(amount, unit)

        let render = useMemo(() => {
            return amount * IntervalToMs[unit] / timePerPixelAnchor > 20
        }, [amount, timePerPixelAnchor, unit])

        let visible = useMemo(() => {
            return amount * IntervalToMs[unit] / timePerPixelAnchor > 25
        }, [amount, timePerPixelAnchor, unit])

        let {transform, transformOrigin} = useTimelyTransform()

        return render ? <animated.g className={'non-scaling-stroke'} style={{transform, transformOrigin}}>
            {intervals?.map(([key, {start}]) => {
                return <line
                    key={key}
                    className={'non-scaling-stroke'}
                    style={{display: visible ? "initial" : "none"}}
                    x1={round((start - timeZero) / timePerPixelAnchor)}
                    x2={round((start - timeZero) / timePerPixelAnchor)}
                    y1={0}
                    y2={round(canvasHeight)}
                    stroke={'rgba(0, 0, 0, 0.2)'}/>
            })}
        </animated.g> : <></>
    })
Lines.displayName = 'Lines'


export const WeekendMarkers: React.FC = React.memo(() => {
    const timeZero = useTimeZero()
    const timePerPixel = useTimePerPixelAnchor()
    const canvasHeight = useCanvasHeight()
    let {transform, transformOrigin} = useTimelyTransform()

    const days = useIntervals(1, 'day')
    const weekends = useMemo(() => {
        return days?.filter(([_, {isWeekend}]) => isWeekend)
    }, [days])

    let render = useMemo(() => {
        return IntervalToMs['day'] / timePerPixel > 20
    }, [timePerPixel])

    let visible = useMemo(() => {
        return IntervalToMs['day'] / timePerPixel > 25
    }, [timePerPixel])

    return render ? <>
        <animated.g
            style={{
                display: visible ? "initial" : "none",
                transform,
                transformOrigin
            }}>
            {weekends?.map(([key, {start, end}]) => {
                return <rect
                    className={'non-scaling-stroke'}
                    key={key}
                    x={round((start - timeZero) / timePerPixel)}
                    width={round((end - start) / timePerPixel)}
                    y={0}
                    height={canvasHeight}
                    fill={'rgb(224,224,224)'}/>
            })}
        </animated.g>
    </> : <></>
})

WeekendMarkers.displayName = 'WeekendMarkers'

export const Grid = React.memo(() => {
    return <g style={{shapeRendering: "geometricPrecision"}}>
        <WeekendMarkers/>
        <Lines amount={100} unit={'years'}/>
        <Lines amount={10} unit={'years'}/>
        <Lines amount={1} unit={'year'}/>
        <Lines amount={3} unit={'months'}/>
        <Lines amount={1} unit={'month'}/>
        <Lines amount={1} unit={'week'}/>
        <Lines amount={1} unit={'day'}/>
        <Lines amount={4} unit={'hours'}/>
        <Lines amount={1} unit={'hour'}/>
        <Lines amount={15} unit={'minutes'}/>
        <Lines amount={1} unit={'minute'}/>
        <Lines amount={15} unit={'seconds'}/>
        <Lines amount={1} unit={'second'}/>
        <Lines amount={100} unit={'milliseconds'}/>
        <Lines amount={10} unit={'milliseconds'}/>
        <Lines amount={1} unit={'milliseconds'}/>
    </g>
})

Grid.displayName = 'Grid'