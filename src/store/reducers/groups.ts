import {PartialTimelineReducer} from '../index'
import {MERGE_NEW_GROUP_DATA} from '../actions'

export const groups: PartialTimelineReducer<'groups'> = () => (state, action) => {
    switch (action.type) {
        case MERGE_NEW_GROUP_DATA: {
            return action.payload
        }
    }
    return state?.groups || {}
}