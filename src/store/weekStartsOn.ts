import {Dispatch, Reducer} from "redux"
import {useDispatch, useSelector} from "react-redux"
import {StoreShape} from "./index"

export type WeekStartsOnState = 0 | 1 | 2 | 3 | 4 | 5 | 6

export let weekStartsOn: Reducer<WeekStartsOnState> = (state, action) => {
    if (action.type === "setWeekStartsOn") {
        return action.payload
    }
    return state || 1
}


export const useWeekStartsOn = () => useSelector<StoreShape, WeekStartsOnState>(state => state.weekStartsOn)

export const setWeekStartsOn = (dispatch: Dispatch, weekStartsOn: WeekStartsOnState) => {
    dispatch({type: 'setWeekStartsOn', payload: weekStartsOn})
}

export const useSetWeekStartsOn = () => {
    let dispatch = useDispatch()
    return (weekStartsOn: WeekStartsOnState) => {
        setWeekStartsOn(dispatch, weekStartsOn)
    }
}