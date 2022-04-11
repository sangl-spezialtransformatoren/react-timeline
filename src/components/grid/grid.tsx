import React, {useMemo} from 'react'
import {OpUnitType} from 'dayjs'

import {useIntervals} from '../../hooks/timeIntervals'
import {IntervalToMs} from '../../units'
import {
    useCanvasHeight,
    useTimelyTransform,
    useTimePerPixelAnchor,
    useTimePerPixelSpring,
    useTimeStartSpring,
    useTimeZero,
} from '../canvas/canvasStore'
import {animated, to} from '@react-spring/konva'
import {Group, Line, Rect} from 'react-konva'

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


        let timeStartSpring = useTimeStartSpring()
        let timePerPixelSpring = useTimePerPixelSpring()
        let translate = to([timeStartSpring, timePerPixelSpring], (timeStart, timePerPixel) => ((timeStart - timeZero) / timePerPixel) || 0)
        let scale = to([timePerPixelSpring], (timePerPixel) => (timePerPixelAnchor / timePerPixel) || 0)

        return render ? <animated.Group offsetX={translate}>
            <animated.Group scaleX={scale}>
                {intervals?.map(([key, {start}]) => {
                    return <Line
                        key={key}
                        visible={visible}
                        points={[(start - timeZero) / timePerPixelAnchor, 0, (start - timeZero) / timePerPixelAnchor, canvasHeight]}
                        stroke={"rgba(0, 0, 0, 0.2)"}
                        strokeWidth={1}
                    />
                })}
            </animated.Group>
        </animated.Group> : <></>
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

    let timePerPixelSpring = useTimePerPixelSpring()
    let timeStartSpring = useTimeStartSpring()
    let timePerPixelAnchor = useTimePerPixelAnchor()
    let translate = to([timeStartSpring, timePerPixelSpring], (timeStart, timePerPixel) => (timeStart - timeZero) / timePerPixel)
    let scale = to([timePerPixelSpring], (timePerPixel) => timePerPixelAnchor / timePerPixel)
    return render ? <>
        <animated.Group offsetX={translate}>
            <animated.Group scaleX={scale}>
                {weekends?.map(([key, {start, end}]) => {
                    return <Rect
                        key={key}
                        x={(start - timeZero) / timePerPixel}
                        width={(end - start) / timePerPixel}
                        y={0}
                        height={canvasHeight}
                        fill={'rgb(224,224,224)'} />
                })}
            </animated.Group>
        </animated.Group>
    </> : <></>
})

WeekendMarkers.displayName = 'WeekendMarkers'

export const Grid = React.memo(() => {
    return <>
        <Lines amount={100} unit={'years'} />
        <Lines amount={10} unit={'years'} />
        <Lines amount={1} unit={'year'} />
        <Lines amount={3} unit={'months'} />
        <Lines amount={1} unit={'month'} />
        <Lines amount={1} unit={'week'} />
        <Lines amount={1} unit={'day'} />
        <Lines amount={4} unit={'hours'} />
        <Lines amount={1} unit={'hour'} />
        <Lines amount={15} unit={'minutes'} />
        <Lines amount={1} unit={'minute'} />
        <Lines amount={15} unit={'seconds'} />
        <Lines amount={1} unit={'second'} />
        <Lines amount={100} unit={'milliseconds'} />
        <Lines amount={10} unit={'milliseconds'} />
        <Lines amount={1} unit={'milliseconds'} />
    </>
})

Grid.displayName = 'Grid'