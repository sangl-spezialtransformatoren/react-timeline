import {PartialTimelineReducer} from '../index'
import {
    DRAG_EVENT,
    DRAG_EVENT_END,
    DRAG_EVENT_START,
    SET_EVENTS,
    STOP_EVENT_DRAG,
    STOP_EVENT_END_DRAG,
    STOP_EVENT_START_DRAG,
} from '../actions'
import {StoreShape} from '../shape'


export type PureInterval = {
    start: number,
    end: number
}

export function makePureInterval(interval: Interval): PureInterval {
    return {
        start: interval.start.valueOf(),
        end: interval.end.valueOf(),
    }
}


export let events: PartialTimelineReducer<'events'> = ({validateDuringDrag, validateDuringResize}) =>
    (state, action) => {
        let newState: StoreShape['events'] = state?.events || {}
        switch (action.type) {
            case SET_EVENTS:
                return action.payload
            case DRAG_EVENT: {
                let id = action.payload.id
                let dx = action.payload.pixels
                let timePerPixel = state?.timeScale.timePerPixel || 1

                let oldEvent = state?.events[id]
                if (oldEvent) {
                    let oldInterval = oldEvent.interval
                    let newInterval = {
                        start: oldInterval.start + dx * timePerPixel,
                        end: oldInterval.end + dx * timePerPixel,
                    }
                    let {interval} = validateDuringDrag({id, newInterval})
                    if (interval) {
                        newState = {
                            ...state?.events,
                            [id]: {
                                ...oldEvent,
                                volatileState: {
                                    interval: makePureInterval(interval) || newInterval,
                                },
                            },
                        }
                    }
                }
                break
            }
            case DRAG_EVENT_START: {
                let id = action.payload.id
                let dx = action.payload.pixels
                let timePerPixel = state?.timeScale.timePerPixel || 1
                let oldEvent = state?.events[id]

                if (oldEvent) {
                    let oldInterval = oldEvent.interval
                    let newInterval = {
                        start: oldInterval.start + dx * timePerPixel,
                        end: oldInterval.end,
                    }
                    let {interval} = validateDuringResize({id, newInterval})
                    if (interval) {
                        newState = {
                            ...state?.events,
                            [id]: {
                                ...oldEvent,
                                volatileState: {
                                    interval: makePureInterval(interval) || newInterval,
                                },
                            },
                        }
                    }
                }
                break
            }
            case DRAG_EVENT_END: {
                let id = action.payload.id
                let dx = action.payload.pixels
                let timePerPixel = state?.timeScale.timePerPixel || 1
                let oldEvent = state?.events[id]
                if (oldEvent) {
                    let oldInterval = oldEvent.interval
                    let newInterval = {
                        start: oldInterval.start,
                        end: oldInterval.end + dx * timePerPixel,
                    }
                    let {interval} = validateDuringResize({id, newInterval})
                    if (interval) {
                        newState = {
                            ...state?.events,
                            [id]: {
                                ...oldEvent,
                                volatileState: {
                                    interval: makePureInterval(interval) || newInterval,
                                },
                            },
                        }
                    }
                }
                break
            }
            case STOP_EVENT_DRAG:
            case STOP_EVENT_START_DRAG:
            case STOP_EVENT_END_DRAG:
                let id = action.payload.id
                let event = state?.events?.[id]
                if (event) {
                    let {volatileState, ...oldEvent} = event
                    newState = {
                        ...state?.events,
                        [id]: {
                            ...oldEvent,
                            interval: volatileState?.interval || event.interval,
                        },
                    }
                }
        }
        return newState
    }
