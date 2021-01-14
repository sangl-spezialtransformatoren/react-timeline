import {Dispatch, Reducer} from "redux"
import {useDispatch, useSelector} from "react-redux"
import {StoreShape} from "./index"

export type SizeState = {
    width: number
    height: number
}

export let size: Reducer<SizeState> = (state, action) => {
    if (action.type === "setSize") {
        return action.payload
    }
    return state || {width: 0, height: 0}
}

export const useSize = () => useSelector<StoreShape, SizeState>(state => state.size)

export const setSize = (dispatch: Dispatch, size: SizeState) => {
    dispatch({type: "setSize", payload: size})
}

export const useSetSize = () => {
    let dispatch = useDispatch()
    return (size: SizeState) => {
        setSize(dispatch, size)
    }
}
