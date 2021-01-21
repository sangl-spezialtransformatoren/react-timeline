import {PartialTimelineReducer} from '../index'
import {
    CHANGE_GROUP,
    COMMIT_DRAG_OR_RESIZE,
    MOVE_EVENT_INTERMEDIARY,
    RESET_DRAG_OR_RESIZE,
    SET_EVENTS,
    UPDATE_EVENTS,
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
            case UPDATE_EVENTS:
                let events = action.payload
                return Object.fromEntries(Object.entries(events).map(
                    ([eventId, event]) => {
                        let volatileState = newState?.[eventId]?.volatileState
                        if (volatileState) {
                            return [eventId, {...event, volatileState}]
                        } else {
                            return [eventId, event]
                        }
                    })
                )
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
                                initialInterval: oldEvent.volatileState?.initialInterval || oldEvent.interval,
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
