import {PartialTimelineReducer} from '../index'
import {SET_SIZE} from '../actions'

export let size: PartialTimelineReducer<'size'> = () => (state, action) => {
    if (action.type === SET_SIZE) {
        return action.payload
    }
    return state?.size || {width: 0, height: 0}
}

