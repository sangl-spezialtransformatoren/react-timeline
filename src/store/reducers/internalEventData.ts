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
                    return [eventId, {selected: event.selected}]
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
            let {updatedEvents, deletedEvents} = action.payload
            newState = Object.fromEntries(Object.entries(newState).filter(([eventId, _]) => !deletedEvents?.includes(eventId)))
            if (updatedEvents) {
                let mergedData: Record<string, InternalEventData> = Object.fromEntries(Object.entries(updatedEvents).map(([eventId, newEvent]) => {
                    return [eventId, {
                        initialInterval: newState?.[eventId]?.initialInterval || newEvent.interval,
                        interval: newEvent.interval,
                        groupId: newEvent.groupId,
                        selected: newState?.[eventId]?.selected,

                    }]
                }))
                newState = {
                    ...newState,
                    ...mergedData,
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
            let {updatedEvents, deletedEvents} = action.payload
            let updatedEventIds = updatedEvents ? Object.keys(updatedEvents) : []
            newState = Object.fromEntries(Object.entries(newState).filter(([eventId, _]) => !deletedEvents?.includes(eventId)))
            newState = Object.fromEntries(Object.entries(newState).map(([eventId, event]) => {
                if (Object.keys(updatedEventIds).includes(eventId)) {
                    return [eventId, event]
                } else {
                    return [eventId, {selected: event.selected}]
                }
            }))
            break
        }
    }
    return newState
}