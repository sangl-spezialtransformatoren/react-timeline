import {Dispatch, Reducer} from "redux"
import {config, SpringConfig} from "react-spring"
import {useDispatch, useSelector} from "react-redux"
import {StoreShape} from "./index"

export type SpringConfigState = SpringConfig

export let springConfig: Reducer<SpringConfigState> = (state, action) => {
    if (action.type === "setSpringConfig") {
        return action.payload
    }
    return state || config.stiff
}

export const useSpringConfig = () => useSelector<StoreShape, any>(state => state.springConfig)

export const setSpringConfig = (dispatch: Dispatch, springConfig: any) => {
    dispatch({type: 'setSpringConfig', payload: springConfig})
}

export const useSetSpringConfig = () => {
    let dispatch = useDispatch()
    return (springConfig: any) => {
        setSpringConfig(dispatch, springConfig)
    }
}