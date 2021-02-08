import {PartialTimelineReducer} from '../index'
import {SET_GROUP_POSITION, UPDATE_GROUPS, UPDATE_GROUPS_INTERMEDIARY} from '../actions'
import {InternalGroupData} from '../shape'

export const internalGroupData: PartialTimelineReducer<'internalGroupData'> = () => (state, action) => {
    let newState: Record<string, InternalGroupData> = state?.internalGroupData || {}
    switch (action.type) {
        case SET_GROUP_POSITION: {
            let {groupId, ...position} = action.payload
            newState = {
                ...newState,
                [groupId]: {
                    ...newState[groupId],
                    position,
                },
            }
            break
        }
        case UPDATE_GROUPS_INTERMEDIARY: {
            let {updatedGroups, deletedGroups} = action.payload
            newState = {
                ...newState,
                ...updatedGroups
            }
            newState = Object.fromEntries(Object.entries(newState).filter(([groupId, _]) => !deletedGroups?.includes(groupId)))
            break
        }
        case UPDATE_GROUPS: {
            let {updatedGroups, deletedGroups} = action.payload
            newState = Object.fromEntries(Object.entries(newState).filter(([groupId, _]) => !(updatedGroups && Object.keys(updatedGroups).includes(groupId) || deletedGroups?.includes(groupId))))
            break
        }
    }
    return newState
}