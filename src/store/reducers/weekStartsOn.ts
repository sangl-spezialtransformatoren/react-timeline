import {PartialTimelineReducer} from '../index'
import {SET_WEEK_STARTS_ON} from '../actions'

export let weekStartsOn: PartialTimelineReducer<'weekStartsOn'> = () => (state, action) => {
    if (action.type === SET_WEEK_STARTS_ON) {
        return action.payload
    }
    return state?.weekStartsOn || 1
}
