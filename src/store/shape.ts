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

export type TimelineGroup = {
    label: string
}

export type StoreShape = {
    animate: boolean
    events: Record<string, TimelineEvent>
    groups: Record<string, TimelineGroup>
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