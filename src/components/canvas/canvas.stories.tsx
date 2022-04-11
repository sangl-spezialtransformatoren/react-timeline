import React, {useEffect, useMemo, useRef} from 'react'
import {Meta} from '@storybook/react/types-6-0'
import {Canvas} from './canvas'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import {useTimePerPixelAnchor, useTimePerPixelSpring, useTimeStartSpring, useTimeZero} from './canvasStore'
import {ReactTimelineHandle, TimelineContext} from '../context/context'
import {animated, to} from '@react-spring/konva'

dayjs.extend(timezone)
dayjs.extend(utc)

export default {
    title: 'canvas',
    component: Canvas,
} as Meta


export const ExampleEvent: React.FC = () => {
    let value = useMemo(() => new Date().valueOf() + 3600 * 1000, [])
    let timeStartSpring = useTimeStartSpring()
    let timePerPixelSpring = useTimePerPixelSpring()

    let timeZero = useTimeZero()
    let timePerPixelAnchor = useTimePerPixelAnchor()
    let translate = to([timeStartSpring, timePerPixelSpring], (timeStart, timePerPixel) => (timeStart - timeZero) / timePerPixel)
    let scale = to([timePerPixelSpring], (timePerPixel) => timePerPixelAnchor / timePerPixel)

    return <animated.Group offsetX={translate}>
        <animated.Group scaleX={scale}>
            <animated.Rect
                x={(value - timeZero) / timePerPixelAnchor}
                y={0}
                width={2 * 3600 * 1000 / timePerPixelAnchor}
                height={20}
                fill={'black'} />
        </animated.Group>
    </animated.Group>
}

export const CanvasDemo = () => {
    let ref = useRef<ReactTimelineHandle>(null)

    useEffect(() => {
        if (ref.current) {
            ref.current.setTimeStart?.(new Date().valueOf() + 3600 * 1000)
            ref.current.setTimePerPixel?.(24 * 3600 * 1000 / 500)
        }
    }, [])

    return <TimelineContext ref={ref}>
        <Canvas width={'100%'} height={500}>
            <ExampleEvent />
        </Canvas>
    </TimelineContext>
}
