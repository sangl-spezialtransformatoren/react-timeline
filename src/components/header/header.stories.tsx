import React, {useEffect, useRef, useState} from 'react'
import {Meta} from '@storybook/react/types-6-0'
import {Header} from './header'
import {Canvas} from '../canvas/canvas'
import {Grid} from '../grid/grid'
import {Event} from '../event/event'
import {Now} from "../now/now"
import {ReactTimelineHandle, TimelineContext} from "../context/context"
import {Scroll} from '../scroll/Scroll'

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

    let [show, setShow] = useState(false)
    useEffect(() => {
        setTimeout(() => setShow(show => !show), 3000)
    }, [])

    return <TimelineContext ref={ref}>
        <Canvas width={"80vw"} height={"80vh"}>
            <Grid/>
            <Scroll>
                <Event groupId={"1"} eventId={"1"}/>
                <Event groupId={"1"} eventId={"2"}/>
                <Event groupId={"1"} eventId={"3"}/>
                <Event groupId={"1"} eventId={"4"}/>
                <Event groupId={"1"} eventId={"5"}/>
                <Event groupId={"1"} eventId={"21"}/>
                <Event groupId={"1"} eventId={"22"}/>
                <Event groupId={"1"} eventId={"23"}/>
                <Event groupId={"1"} eventId={"24"}/>
            </Scroll>
            <Scroll>
                {show && <Event groupId={"2"} eventId={"25"}/>}
                {show && <Event groupId={"2"} eventId={"31"}/>}
                {show && <Event groupId={"2"} eventId={"32"}/>}
                {show && <Event groupId={"2"} eventId={"33"}/>}
                {show && <Event groupId={"2"} eventId={"34"}/>}
                {show && <Event groupId={"2"} eventId={"35"}/>}
                {show && <Event groupId={"2"} eventId={"321"}/>}
                {show && <Event groupId={"2"} eventId={"322"}/>}
                {show && <Event groupId={"2"} eventId={"323"}/>}
                {show && <Event groupId={"2"} eventId={"324"}/>}
                {show && <Event groupId={"2"} eventId={"325"}/>}
                {show && <Event groupId={"2"} eventId={"a2"}/>}
                {show && <Event groupId={"2"} eventId={"a3"}/>}
                {show && <Event groupId={"2"} eventId={"a4"}/>}
                {show && <Event groupId={"2"} eventId={"a5"}/>}
                {show && <Event groupId={"2"} eventId={"a21"}/>}
                {show && <Event groupId={"2"} eventId={"a22"}/>}
                {show && <Event groupId={"2"} eventId={"a23"}/>}
                {show && <Event groupId={"2"} eventId={"a24"}/>}
                {show && <Event groupId={"2"} eventId={"a25"}/>}
                {show && <Event groupId={"2"} eventId={"a31"}/>}
                {show && <Event groupId={"2"} eventId={"a32"}/>}
                {show && <Event groupId={"2"} eventId={"a33"}/>}
                {show && <Event groupId={"2"} eventId={"a34"}/>}
                {show && <Event groupId={"2"} eventId={"a35"}/>}
                {show && <Event groupId={"2"} eventId={"a321"}/>}
                {show && <Event groupId={"2"} eventId={"a322"}/>}
                {show && <Event groupId={"2"} eventId={"a323"}/>}
                {show && <Event groupId={"2"} eventId={"a324"}/>}
                {show && <Event groupId={"2"} eventId={"a325"}/>}
            </Scroll>
            <Header/>
        </Canvas>
    </TimelineContext>
}
