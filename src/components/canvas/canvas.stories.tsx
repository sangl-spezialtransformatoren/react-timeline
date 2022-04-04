import React, {useEffect, useRef} from 'react'
import {Meta} from '@storybook/react/types-6-0'
import {Canvas} from './canvas'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import {useTimePerPixelAnchor, useTimeZero} from "./canvasStore"
import {ReactTimelineHandle, TimelineContext} from "../context/context"

dayjs.extend(timezone)
dayjs.extend(utc)

export default {
    title: 'canvas',
    component: Canvas,
} as Meta


const ExampleEvent: React.FC = () => {
    let timePerPixelAnchor = useTimePerPixelAnchor()
    let timeZero = useTimeZero()

    return <rect
        className={'timely'}
        x={(new Date().valueOf() + 3600 * 1000 - timeZero) / timePerPixelAnchor}
        y={0}
        width={2 * 3600 * 1000 / timePerPixelAnchor}
        height={20}
        fill={'black'}/>
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
            <ExampleEvent/>
        </Canvas>
    </TimelineContext>
}
