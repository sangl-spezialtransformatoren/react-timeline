import {PureInterval} from './reducers/events'
import {SpringConfig} from './reducers/springConfig'
import {DefaultEventShape, DefaultGroupShape} from "../definitions"


export type TimelineEvent = {
    interval: PureInterval
    group?: string
    manipulated?: boolean
    volatileState?: {
        interval: PureInterval
    }
}

type AdditionalData<T> = T & { volatileState?: { interval: PureInterval } }

export type StoreShape<Event = AdditionalData<DefaultEventShape>, Group = DefaultGroupShape> = {
    animate: boolean
    events: Record<string, Event>
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