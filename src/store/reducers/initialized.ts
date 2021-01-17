import {PartialTimelineReducer} from '../index'
import {SET_INITIALIZED} from '../actions'

export let initialized: PartialTimelineReducer<'initialized'> = () => (state, action) => {
    if (action.type === SET_INITIALIZED) {
        return action.payload
    }
    return state?.initialized || false
}
