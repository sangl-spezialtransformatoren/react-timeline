import {PartialTimelineReducer} from '../index'
import {SET_GROUP_POSITION} from '../actions'

export const groups: PartialTimelineReducer<'groups'> = () => (state, action) => {
    switch (action.type) {
        case SET_GROUP_POSITION: {
            let {groupId, ...position} = action.payload
            return {
                ...state?.groups,
                [groupId]: {
                    ...state?.groups?.[groupId],
                    position,
                },
            }
        }
    }
    return state?.groups || {}
}