import React, {useEffect} from 'react'
import {Meta} from '@storybook/react/types-6-0'
import {Canvas, useCanvasStore} from './canvas'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(timezone)
dayjs.extend(utc)

export default {
    title: 'canvas',
    component: Canvas,
} as Meta

export const CanvasDemo = () => {
    const {
        setTimePerPixel,
        setTimeZero,
        setTimeStart,
        timePerPixel,
        timePerPixelAnchor,
        setTimePerPixelAnchor,
        timeZero
    } = useCanvasStore()

    useEffect(() => {
        setTimePerPixel(24 * 3600 * 1000 / 500)
        setTimePerPixelAnchor(24 * 3600 * 1000 / 500)
        setTimeZero(new Date().valueOf())
        setTimeStart(new Date().valueOf() + 3600 * 1000)
    }, [])

    return <Canvas width={'100%'} height={500}>
        <rect
            className={'timely'}
            x={(new Date().valueOf() + 3600 * 1000 - timeZero) / timePerPixelAnchor}
            y={0}
            width={2 * 3600 * 1000 / timePerPixel}
            height={20}
            fill={'black'}/>
    </Canvas>
}
