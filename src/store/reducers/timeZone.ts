import {PartialTimelineReducer} from '../index'
import {SET_TIME_ZONE} from '../actions'

export let timeZone: PartialTimelineReducer<'timeZone'> = () => (state, action) => {
    if (action.type === SET_TIME_ZONE) {
        return action.payload
    }
    return state?.timeZone || 'Etc/UTC'
}
