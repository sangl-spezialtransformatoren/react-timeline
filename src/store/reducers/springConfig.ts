import {config} from 'react-spring'
import {PartialTimelineReducer} from '../index'
import {SET_SPRING_CONFIG} from '../actions'

export type SpringConfig = any

export let springConfig: PartialTimelineReducer<'springConfig'> = () => (state, action) => {
    if (action.type === SET_SPRING_CONFIG) {
        return action.payload
    }
    return state?.springConfig || (config.stiff as unknown as any)
}
