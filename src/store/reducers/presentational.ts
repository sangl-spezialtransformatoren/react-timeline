import {PartialTimelineReducer} from '../index'
import {SET_HEADER_HEIGHT} from '../actions'


export let presentational: PartialTimelineReducer<'presentational'> = () => (state, action) => {
    switch (action.type) {
        case SET_HEADER_HEIGHT: {
            return {
                ...state?.presentational,
                headerHeight: action.payload,
            }
        }
    }
    return state?.presentational || {headerHeight: 0}
}
