import React from 'react'
import {config, SpringConfig, SpringValue} from 'react-spring'
import {BusinessLogic, DefaultBusinessLogic} from './store/businessLogic'
import {RequiredEventData, RequiredGroupData} from './store/shape'
import {PresentationalEventComponent} from "./components/event"
import {DefaultEventComponent} from "./presentational/event"

export type TimelineStyle = {
    width?: React.CSSProperties['width']
    height?: React.CSSProperties['height']
}

export type InitialTimelineParameters = {
    startDate: Date | number
    endDate: Date | number
}


export type TimelineProps<Event extends RequiredEventData = RequiredEventData, Group extends RequiredGroupData = RequiredGroupData, Y = PresentationalEventComponent> = {
    timeZone?: string
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    animate?: boolean
    events?: Record<string, Event>
    groups?: Record<string, Group>
    initialStartDate?: Date | number
    initialEndDate?: Date | number
    style?: TimelineStyle
    springConfig?: SpringConfig
    businessLogic?: BusinessLogic<Event, Group>
    eventComponent?: Y extends PresentationalEventComponent<infer T> ? PresentationalEventComponent<T> : never
    eventHeight?: number
    eventSpacing?: number
    groupPadding?: number
    minGroupHeight?: number
    drawerWidth?: number
}

export const DefaultTimelineProps: Partial<TimelineProps> = {
    animate: true,
    timeZone: 'Etc/UTC',
    weekStartsOn: 1,
    businessLogic: DefaultBusinessLogic,
    springConfig: config.stiff,
    eventComponent: DefaultEventComponent
}

export function SpringConstant<T>() {
    return new SpringValue<T>()
}
