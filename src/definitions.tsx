import React from 'react'
import {config, SpringConfig, SpringValue} from 'react-spring'
import {BusinessLogic, DefaultBusinessLogic} from './store/businessLogic'
import {RequiredEventData, RequiredGroupData, StoreShape} from './store/shape'
import {PureInterval} from './store/reducers/events'
import {PresentationalEventComponent} from "./event"
import {DefaultEventComponent} from "./presentational/event"

export type TimelineStyle = {
    width?: React.CSSProperties['width']
    height?: React.CSSProperties['height']
}

export type InitialTimelineParameters = {
    startDate: Date | number
    endDate: Date | number
}


export type DefaultEventShape = {
    interval: PureInterval,
    label: string
    groupId: string
}

export type DefaultGroupShape = {
    label: string
}

export type TimelineProps<Event extends RequiredEventData = RequiredEventData, Group extends RequiredGroupData = RequiredGroupData, Y = PresentationalEventComponent> = {
    timeZone?: string
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    animate?: boolean
    initialData?: { events: StoreShape['events'], groups: StoreShape['groups'] }
    initialParameters?: InitialTimelineParameters
    style?: TimelineStyle,
    springConfig?: SpringConfig,
    businessLogic?: BusinessLogic<Event, Group>,
    eventComponent?: Y extends PresentationalEventComponent<infer T> ? PresentationalEventComponent<T> : never
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
