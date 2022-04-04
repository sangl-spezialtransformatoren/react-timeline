import React, {useEffect, useRef} from 'react'
import {Meta} from '@storybook/react/types-6-0'
import {Header} from './header'
import {Canvas} from '../canvas/canvas'
import {Grid} from '../grid/grid'
import {Event} from '../event/event'
import {Now} from "../now/now"
import {ReactTimelineHandle, TimelineContext} from "../context/context"

export default {
    title: 'Components/Header',
    component: Header,
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
            <Grid/>
            <Now/>
            <Event groupId={"1"} eventId={"1"}/>
            <Event groupId={"1"} eventId={"2"}/>
            <Event groupId={"1"} eventId={"3"}/>
            <Event groupId={"1"} eventId={"4"}/>
            <Event groupId={"1"} eventId={"5"}/>
            <Event groupId={"1"} eventId={"21"}/>
            <Event groupId={"1"} eventId={"22"}/>
            <Event groupId={"1"} eventId={"23"}/>
            <Event groupId={"1"} eventId={"24"}/>
            <Event groupId={"1"} eventId={"25"}/>
            <Event groupId={"1"} eventId={"31"}/>
            <Event groupId={"1"} eventId={"32"}/>
            <Event groupId={"1"} eventId={"33"}/>
            <Event groupId={"1"} eventId={"34"}/>
            <Event groupId={"1"} eventId={"35"}/>
            <Event groupId={"1"} eventId={"321"}/>
            <Event groupId={"1"} eventId={"322"}/>
            <Event groupId={"1"} eventId={"323"}/>
            <Event groupId={"1"} eventId={"324"}/>
            <Event groupId={"1"} eventId={"325"}/>
            <Event groupId={"1"} eventId={"a2"}/>
            <Event groupId={"1"} eventId={"a3"}/>
            <Event groupId={"1"} eventId={"a4"}/>
            <Event groupId={"1"} eventId={"a5"}/>
            <Event groupId={"1"} eventId={"a21"}/>
            <Event groupId={"1"} eventId={"a22"}/>
            <Event groupId={"1"} eventId={"a23"}/>
            <Event groupId={"1"} eventId={"a24"}/>
            <Event groupId={"1"} eventId={"a25"}/>
            <Event groupId={"1"} eventId={"a31"}/>
            <Event groupId={"1"} eventId={"a32"}/>
            <Event groupId={"1"} eventId={"a33"}/>
            <Event groupId={"1"} eventId={"a34"}/>
            <Event groupId={"1"} eventId={"a35"}/>
            <Event groupId={"1"} eventId={"a321"}/>
            <Event groupId={"1"} eventId={"a322"}/>
            <Event groupId={"1"} eventId={"a323"}/>
            <Event groupId={"1"} eventId={"a324"}/>
            <Event groupId={"1"} eventId={"a325"}/>
            <Header/>
        </Canvas>
    </TimelineContext>
}
