import {PartialTimelineReducer} from '../index'
import {MERGE_NEW_GROUP_DATA, UPDATE_GROUPS} from '../actions'

export const groups: PartialTimelineReducer<'groups'> = () => (state, action) => {
    let newState = state?.groups || {}
    switch (action.type) {
        case MERGE_NEW_GROUP_DATA: {
            newState = action.payload
            break
        }
        case UPDATE_GROUPS: {
            let {updatedGroups, deletedGroups} = action.payload
            newState = {
                ...newState,
                ...updatedGroups
            }
            newState = Object.fromEntries(Object.entries(newState).filter(([groupId, _]) => !deletedGroups?.includes(groupId)))
            break
        }
    }
    return newState
}