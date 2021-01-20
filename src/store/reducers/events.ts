import {PartialTimelineReducer} from '../index'
import {
    CHANGE_GROUP,
    COMMIT_DRAG_OR_RESIZE,
    MOVE_EVENT_INTERMEDIARY,
    RESET_DRAG_OR_RESIZE,
    SET_EVENTS,
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


export let events: PartialTimelineReducer<'events'> = () =>
    (state, action) => {
        let newState: StoreShape['events'] = state?.events || {}
        switch (action.type) {
            case SET_EVENTS:
                return action.payload
            case MOVE_EVENT_INTERMEDIARY: {
                let id = action.payload.id
                let interval = action.payload.interval

                let oldEvent = state?.events[id]
                if (oldEvent) {
                    newState = {
                        ...state?.events,
                        [id]: {
                            ...oldEvent,
                            volatileState: {
                                interval: interval,
                            },
                        },
                    }
                }
                break
            }
            case RESET_DRAG_OR_RESIZE: {
                let id = action.payload.id
                let event = state?.events?.[id]
                if (event) {
                    let {volatileState, ...oldEvent} = event
                    if (volatileState?.interval) {
                        newState = {
                            ...state?.events,
                            [id]: oldEvent,
                        }
                    }
                }
                break
            }
            case COMMIT_DRAG_OR_RESIZE: {
                let id = action.payload.id
                let event = state?.events?.[id]
                if (event) {
                    let {volatileState, ...oldEvent} = event
                    if (volatileState?.interval) {
                        newState = {
                            ...state?.events,
                            [id]: {
                                ...oldEvent,
                                interval: volatileState.interval,
                            },
                        }
                    }
                }
                break
            }
            case CHANGE_GROUP: {
                let id = action.payload.id
                let groupId = action.payload.groupId

                let event = state?.events?.[id]
                if (event) {
                    newState = {
                        ...state?.events,
                        [id]: {
                            ...event,
                            groupId: groupId,
                        },
                    }
                }
                break
            }
        }
        return newState
    }
