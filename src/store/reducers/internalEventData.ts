import {PartialTimelineReducer} from '../index'
import {
    DESELECT_ALL_EVENTS,
    MOVE_EVENT_INTERMEDIARY,
    RESET_DRAG_OR_RESIZE,
    TOGGLE_EVENT_SELECTED,
    UPDATE_EVENTS,
    UPDATE_EVENTS_INTERMEDIARY,
} from '../actions'
import {InternalEventData} from '../shape'

export const internalEventData: PartialTimelineReducer<'internalEventData'> = () => (state, action) => {
    let newState: Record<string, InternalEventData> = state?.internalEventData || {}
    switch (action.type) {
        case MOVE_EVENT_INTERMEDIARY: {
            let id = action.payload.id
            let interval = action.payload.interval

            let event = state?.events[id]
            if (event) {
                newState = {
                    ...state?.events,
                    [id]: {
                        ...newState[id],
                        initialInterval: newState?.[id]?.initialInterval || event.interval,
                        interval: interval,
                    },
                }
            }
            break
        }
        case RESET_DRAG_OR_RESIZE: {
            newState = Object.fromEntries(
                Object.entries(newState).map(([eventId, event]) => {
                    let {interval, initialInterval, ...rest} = event
                    return [eventId, rest]
                }))
            break
        }
        case TOGGLE_EVENT_SELECTED: {
            let id = action.payload.id
            newState = {
                ...newState,
                [id]: {
                    ...newState?.[id],
                    selected: !newState?.[id]?.selected,
                },
            }
            break
        }
        case UPDATE_EVENTS_INTERMEDIARY: {
            let events = action.payload.events
            for (let [eventId, event] of Object.entries(events)) {
                newState = {
                    ...newState,
                    [eventId]: {
                        ...newState[eventId],
                        initialInterval: newState[eventId]?.initialInterval || state?.events[eventId].interval,
                        interval: event.interval,
                        groupId: event.groupId,
                    },
                }
            }
            break
        }
        case DESELECT_ALL_EVENTS: {
            for (let [eventId, event] of Object.entries(newState)) {
                newState = {
                    ...newState,
                    [eventId]: {
                        ...event,
                        selected: false,
                    },
                }
            }
            break
        }
        case UPDATE_EVENTS: {
            let events = action.payload.events
            for (let eventId of Object.keys(events)) {
                let {interval, initialInterval, groupId, ...rest} = newState[eventId]
                newState = {
                    ...newState,
                    [eventId]: rest,
                }
            }
            break
        }
    }
    return newState
}