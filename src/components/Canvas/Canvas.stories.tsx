import React, {useMemo} from 'react'
import {Canvas} from './Canvas'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import {Meta} from '@storybook/react'
import {Grid} from '../Grid/grid'
import {useTimePerPixel, useTimeStart} from './store'
import {animated, to} from '@react-spring/web'
import {Now, TimeEnd, TimeStart} from '../Markers/Markers'

dayjs.extend(timezone)
dayjs.extend(utc)

export default {
    title: 'Canvas',
    component: Canvas,
    parameters: {
        layout: 'fullscreen'
    }
} as Meta


const ExampleEvent: React.FC = () => {
    let timeStart = useTimeStart()
    let timePerPixelSpring = useTimePerPixel()
    let start = useMemo(() => new Date().valueOf() + 3600 * 1000, [])
    let end = useMemo(() => new Date().valueOf() + 5 * 3600 * 1000, [])

    return <animated.rect
        className={'timely'}
        x={to([timeStart, timePerPixelSpring], (timeStart, timePerPixel) => (start - timeStart) / timePerPixel)}
        y={0}
        width={to(timePerPixelSpring, (timePerPixel) => (end - start) / timePerPixel)}
        height={20}
        fill={'black'} />
}

export const CanvasNewDemo = () => {
    return <Canvas style={{width: '100%', height: '900px'}}>
        <Grid />
        <Now />
        <ExampleEvent />
    </Canvas>
}
