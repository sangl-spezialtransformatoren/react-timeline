import React, {useMemo} from 'react'
import {OpUnitType} from 'dayjs'

import {useCanvasHeight, useTimePerPixelAnchor, useTimeZero} from '../canvas/canvas'
import {useIntervals} from '../../hooks/timeIntervals'
import {IntervalToMs} from '../../units'
import {Defer} from "../../functions/Defer"

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

        return render ? <g className={'timely easing'}>
            <Defer chunkSize={10}>
                {intervals?.map(([key, {start}]) => {
                    return <line
                        key={key}
                        className={'non-scaling-stroke'}
                        style={{opacity: visible ? 1 : 0}}
                        x1={(start - timeZero) / timePerPixelAnchor}
                        x2={(start - timeZero) / timePerPixelAnchor}
                        y1={0}
                        y2={canvasHeight}
                        stroke={'rgba(0, 0, 0, 0.2)'}/>
                })}
            </Defer>
        </g> : <></>
    })
Lines.displayName = 'Lines'


export const WeekendMarkers: React.FC = React.memo(() => {
    const timeZero = useTimeZero()
    const timePerPixel = useTimePerPixelAnchor()
    const canvasHeight = useCanvasHeight()

    const days = useIntervals(1, 'day')
    const weekends = useMemo(() => {
        return days?.filter(([_, {isWeekend}]) => isWeekend)
    }, [days])
    let visible = useMemo(() => {
        return IntervalToMs['day'] / timePerPixel > 3
    }, [timePerPixel])

    return <g className={'timely easing'}
              style={{
                  opacity: visible ? 1 : 0,
                  transition: "opacity 0.2s",
                  willChange: "opacity, transform"
              }}>
        <Defer chunkSize={10}>
            {weekends?.map(([key, {start, end}]) => {
                return <rect
                    key={key}
                    className={'non-scaling-stroke'}
                    x={(start - timeZero) / timePerPixel}
                    width={(end - start) / timePerPixel}
                    y={0}
                    height={canvasHeight}
                    fill={'rgb(224,224,224)'}/>
            })}
        </Defer>
    </g>
})

WeekendMarkers.displayName = 'WeekendMarkers'

export const Grid = React.memo(() => {
    return <>
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
    </>
})

Grid.displayName = 'Grid'