import React, {useEffect} from 'react'
import {Meta} from '@storybook/react/types-6-0'
import {Grid} from './grid'
import {Canvas, useCanvasStore} from '../canvas/canvas'

export default {
    title: 'Components/Grid',
    component: Grid,
    argTypes: {
        timePerPixelControl: {
            control: {type: 'number'},
            defaultValue: 24 * 3600 * 1000 / 500,
        },
        timeStartControl: {
            control: {type: 'date'},
            defaultValue: new Date,
        },
    },
} as Meta

export const x = ({timePerPixelControl, timeStartControl}: any) => {
    let setTimePerPixel = useCanvasStore(state => state.setTimePerPixel)
    let setTimeStart = useCanvasStore(state => state.setTimeStart)

    useEffect(() => {
        setTimePerPixel(timePerPixelControl)
    }, [timePerPixelControl])

    useEffect(() => {
        setTimeStart(timeStartControl)
    }, [timeStartControl])

    return <Canvas width={1200} height={500}>
        <Grid />
    </Canvas>
}
