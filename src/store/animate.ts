import {Dispatch, Reducer} from "redux"
import {useDispatch, useSelector} from "react-redux"
import {StoreShape} from "./index"

export type AnimateState = boolean

export let animate: Reducer<AnimateState> = (state, action) => {
    if (action.type === "setAnimate") {
        return action.payload
    }
    return state || false
}


export const useAnimate = () => useSelector<StoreShape, AnimateState>(state => state.animate)

export const setAnimate = (dispatch: Dispatch, animate: boolean) => {
    dispatch({type: 'setAnimate', payload: animate})
}

export const useSetAnimate = () => {
    let dispatch = useDispatch()
    return (animate: boolean) => {
        setAnimate(dispatch, animate)
    }
}