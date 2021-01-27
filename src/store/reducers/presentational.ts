import {PartialTimelineReducer} from '../index'
import {SET_HEADER_HEIGHT, SET_SCROLL_OFFSET} from '../actions'


export let presentational: PartialTimelineReducer<'presentational'> = () => (state, action) => {
    let newState = state?.presentational || {headerHeight: 0, scrollOffset: 0}
    switch (action.type) {
        case SET_HEADER_HEIGHT: {
            newState = {
                ...newState,
                headerHeight: action.payload,
            }
            break
        }
        case SET_SCROLL_OFFSET: {
            newState = {
                ...newState,
                scrollOffset: action.payload,
            }
            break
        }
    }
    return newState
}
