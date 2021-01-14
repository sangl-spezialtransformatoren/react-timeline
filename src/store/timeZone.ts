import {Dispatch, Reducer} from "redux"
import {useDispatch, useSelector} from "react-redux"
import {StoreShape} from "./index"

export type TimeZoneState = string

export let timeZone: Reducer<TimeZoneState> = (state, action) => {
    if (action.type === "setTimeZone") {
        return action.payload
    }
    return state || "Etc/UTC"
}

export const useTimeZone = () => useSelector<StoreShape, TimeZoneState>(state => state.timeZone)

export const setTimeZone = (dispatch: Dispatch, timeZone: string) => {
    dispatch({type: 'setTimeZone', payload: timeZone})
}

export const useSetTimeZone = () => {
    let dispatch = useDispatch()
    return (timeZone: string) => {
        setTimeZone(dispatch, timeZone)
    }
}