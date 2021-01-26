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

export type InternalEventData = {
    selected?: boolean
    volatileState?: {
        interval?: PureInterval
        initialInterval?: PureInterval
        groupId?: string
    }
}

export type RequiredGroupData = {}

export type InternalGroupData = {
    position?: {
        x: number,
        y: number,
        width: number
        height: number
    }
}

export type StoreShape<Event extends RequiredEventData = RequiredEventData, Group extends RequiredGroupData = RequiredGroupData> = {
    animate: boolean
    events: Record<string, Event & InternalEventData>
    groups: Record<string, Group & InternalGroupData>
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
    presentational: {
        headerHeight: number
    }
}