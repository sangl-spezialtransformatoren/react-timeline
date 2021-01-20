import {PureInterval} from './reducers/events'
import {SpringConfig} from './reducers/springConfig'


export type TimelineEvent = {
    interval: PureInterval
    group?: string
    manipulated?: boolean
    volatileState?: {
        interval: PureInterval
    }
}

export type RequiredEventData = {
    interval: PureInterval
    groupId: string
}

export type IntervalEventData = {
    volatileState?: {
        interval: PureInterval
    }
}

export type RequiredGroupData = {}

export type StoreShape<Event extends RequiredEventData = RequiredEventData, Group extends RequiredGroupData = RequiredGroupData> = {
    animate: boolean
    events: Record<string, Event & IntervalEventData>
    groups: Record<string, Group>
    initialized: boolean
    size: {
        width: number,
        height: number
    }
    springConfig: SpringConfig
    timeScale: {
        startDate: Date | number,
        dateZero: Date | number,
        timePerPixel: number,
        zoomCenter?: Date | number
    }
    timeZone: string
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
}