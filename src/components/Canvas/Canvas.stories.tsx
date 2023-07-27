import React from 'react'
import {Canvas} from './Canvas'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import {Meta} from '@storybook/react'
import {Grid, WeekendMarkers} from '../Grid/Grid'
import {Now} from '../Markers/Markers'
import {Header} from '../Header/Header'
import {Event} from "../Event/Event"

dayjs.extend(timezone)
dayjs.extend(utc)

export default {
    title: 'Canvas',
    component: Canvas,
    parameters: {
        layout: 'fullscreen'
    }
} as Meta


export const CanvasNewDemo = () => {
    return <Canvas style={{width: '100%', height: '900px'}}>
        <Grid/>
        <WeekendMarkers/>
        <Now/>
        <Header/>
        {[...new Array(150)].map((i) => {
            return <Event key={i}/>
        })}
    </Canvas>
}
