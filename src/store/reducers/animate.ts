import {PartialTimelineReducer} from '../index'
import {SET_ANIMATE} from '../actions'


export let animate: PartialTimelineReducer<'animate'> = () => (state, action) => {
    if (action.type === SET_ANIMATE) {
        return action.payload
    }
    return state?.animate || true
}
