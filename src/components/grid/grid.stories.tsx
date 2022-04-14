import React, {useEffect, useRef} from 'react'
import {Meta} from '@storybook/react/types-6-0'
import {Grid} from './grid'
import {Canvas} from '../canvas/canvas'
import {ReactTimelineHandle, TimelineContext} from "../context/context"
import {orderedArraySetAdd, orderedArraySetRemove, indexOf, indexOfFirstGreaterThan} from "../../functions/orderedArray"

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

export const X = ({timePerPixelControl, timeStartControl}: any) => {
    let ref = useRef<ReactTimelineHandle>(null)

    useEffect(() => {
        ref.current?.setTimePerPixel?.(timePerPixelControl)
    }, [timePerPixelControl])

    useEffect(() => {
        ref.current?.setTimeStart?.(timeStartControl)
    }, [timeStartControl])

    useEffect(() => {
        let array = ["a", "b", "c"]
        array = orderedArraySetAdd(array, "ab")
        array = orderedArraySetAdd(array, "aa")
        array = orderedArraySetRemove(array, "ab")
    })

    return <TimelineContext ref={ref}>
        <Canvas width={1200} height={500}>
            <Grid/>
        </Canvas>
    </TimelineContext>
}
