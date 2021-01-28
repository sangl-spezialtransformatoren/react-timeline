import {PartialTimelineReducer} from '../index'
import {SET_HEADER_HEIGHT} from '../actions'


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
    }
    return newState
}
