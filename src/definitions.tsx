import React from 'react'
import {config, SpringConfig, SpringValue} from 'react-spring'
import {BusinessLogic, DefaultConfig} from './store/businessLogic'
import {StoreShape} from './store/shape'

export type TimelineStyle = {
    width?: React.CSSProperties['width']
    height?: React.CSSProperties['height']
}

export type InitialTimelineParameters = {
    startDate: Date | number
    endDate: Date | number
}

export type TimelineProps = {
    timeZone?: string
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    animate?: boolean
    initialData?: { events: StoreShape['events'], groups: StoreShape['groups'] }
    initialParameters?: InitialTimelineParameters
    style?: TimelineStyle,
    springConfig?: SpringConfig,
    config?: BusinessLogic,
}

export const DefaultTimelineProps: Partial<TimelineProps> = {
    animate: true,
    timeZone: 'Etc/UTC',
    weekStartsOn: 1,
    config: DefaultConfig,
    springConfig: config.stiff,
}

export function SpringConstant<T>() {
    return new SpringValue<T>()
}
