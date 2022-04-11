import React, {useEffect, useRef} from 'react'
import {Meta} from '@storybook/react/types-6-0'
import {Header} from './header'
import {Canvas} from '../canvas/canvas'
import {Grid} from '../grid/grid'
import {ReactTimelineHandle, TimelineContext} from '../context/context'
import {ExampleEvent} from '../canvas/canvas.stories'

export default {
    title: 'Components/Header',
    component: Header,
    argTypes: {
        timePerPixelControl: {
            control: {type: 'number'},
            defaultValue: 24 * 3600 * 1000 / 500
        },
        timeStartControl: {
            control: {type: 'date'},
            defaultValue: new Date
        }
    }
} as Meta

export const C = ({timePerPixelControl, timeStartControl}: any) => {
    let ref = useRef<ReactTimelineHandle>(null)

    useEffect(() => {
        ref.current?.setTimePerPixel?.(timePerPixelControl.valueOf())
    }, [timePerPixelControl])

    useEffect(() => {
        ref.current?.setTimeStart?.(timeStartControl.valueOf())
    }, [timeStartControl])

    return <TimelineContext ref={ref}>
        <Canvas width={1200} height={800}>
            <Grid />
            <ExampleEvent />
            <Header />
        </Canvas>
    </TimelineContext>
}
