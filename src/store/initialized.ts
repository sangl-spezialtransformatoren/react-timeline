import {Dispatch, Reducer} from "redux"
import {useDispatch, useSelector} from "react-redux"
import {StoreShape} from "./index"

export type InitializedState = boolean

export let initialized: Reducer<InitializedState> = (state, action) => {
    if (action.type === "setInitialized") {
        return action.payload
    }
    return state || false
}

export const useInitialized = () => useSelector<StoreShape, InitializedState>(state => state.initialized)

export const setInitialized = (dispatch: Dispatch, initialized: boolean) => {
    dispatch({type: 'setInitialized', payload: initialized})
}

export const useSetInitialized = () => {
    let dispatch = useDispatch()
    return (initialized: boolean) => {
        setInitialized(dispatch, initialized)
    }
}