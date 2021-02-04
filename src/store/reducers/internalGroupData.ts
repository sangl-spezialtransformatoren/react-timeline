import {PartialTimelineReducer} from '../index'
import {SET_GROUP_POSITION} from '../actions'
import {InternalGroupData} from '../shape'

export const internalGroupData: PartialTimelineReducer<'internalGroupData'> = () => (state, action) => {
    let newState: Record<string, InternalGroupData> = state?.internalGroupData || {}
    switch (action.type) {
        case SET_GROUP_POSITION: {
            let {groupId, ...position} = action.payload
            return {
                ...newState,
                [groupId]: {
                    ...newState[groupId],
                    position,
                },
            }
        }
    }
    return newState
}