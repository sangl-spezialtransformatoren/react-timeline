import {PartialTimelineReducer} from '../index'
import {
    CHANGE_GROUP,
    DESELECT_ALL_EVENTS,
    MERGE_NEW_EVENT_DATA,
    MOVE_EVENT_INTERMEDIARY,
    RESET_DRAG_OR_RESIZE,
    SET_EVENTS,
    TOGGLE_EVENT_SELECTED,
    UPDATE_EVENTS,
    UPDATE_EVENTS_INTERMEDIARY,
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
            case MERGE_NEW_EVENT_DATA:
                let events = action.payload
                return Object.fromEntries(Object.entries(events).map(
                    ([eventId, event]) => {
                        let volatileState = newState?.[eventId]?.volatileState
                        if (volatileState) {
                            return [eventId, {...event, volatileState}]
                        } else {
                            return [eventId, event]
                        }
                    }),
                )
            case UPDATE_EVENTS: {
                let events = action.payload.events
                if (state?.events) {
                    newState = Object.fromEntries(Object.entries(state?.events).map(([eventId, oldEvent]) => {
                        let {volatileState, ...staticData} = oldEvent
                        let event = events[eventId]
                        if (event) {
                            return [eventId, {
                                ...staticData,
                                interval: event.interval
                            }]
                        } else {
                            return [eventId, oldEvent]
                        }
                    }))
                }
                break
            }
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
                newState = Object.fromEntries(Object.entries(newState).map(([eventId, event]) => {
                    let {volatileState, ...oldEvent} = event
                    return [eventId, oldEvent]
                }))
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
            case TOGGLE_EVENT_SELECTED: {
                let id = action.payload.id
                let event = state?.events?.[id]
                if (event) {
                    newState = {
                        ...state?.events,
                        [id]: {
                            ...event,
                            selected: !event.selected,
                        },
                    }
                }
                break
            }
            case UPDATE_EVENTS_INTERMEDIARY: {
                let events = action.payload.events
                if (state?.events) {
                    newState = Object.fromEntries(Object.entries(state?.events).map(([eventId, oldEvent]) => {
                        let event = events[eventId]
                        if (event) {
                            return [eventId, {
                                ...oldEvent,
                                volatileState: {
                                    initialInterval: oldEvent.volatileState?.initialInterval || oldEvent.interval,
                                    interval: event.interval
                                }
                            }]
                        } else {
                            return [eventId, oldEvent]
                        }

                    }))
                }
                break
            }
            case DESELECT_ALL_EVENTS: {
                if (state?.events) {
                    return Object.fromEntries(Object.entries(state.events).map(([eventId, event]) => [
                        eventId,
                        {...event, selected: false}
                    ]))
                }
                break
            }
        }
        return newState
    }
