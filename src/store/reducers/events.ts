import {PartialTimelineReducer} from '../index'
import {CHANGE_GROUP, MERGE_NEW_EVENT_DATA, SET_EVENTS, UPDATE_EVENTS} from '../actions'
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


export let events: PartialTimelineReducer<'events'> = (config) =>
    (state, action) => {
        let newState: StoreShape['events'] = state?.events || {}
        switch (action.type) {
            case SET_EVENTS:
                newState = action.payload
                break
            case MERGE_NEW_EVENT_DATA:
                newState = config.mergeNewEvents(newState, action.payload)
                break
            case UPDATE_EVENTS: {
                let events = action.payload.events
                for (let eventId of Object.keys(newState)) {
                    let newEvent = events?.[eventId]
                    if (newEvent) {
                        newState = {
                            ...newState,
                            [eventId]: newEvent,
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
