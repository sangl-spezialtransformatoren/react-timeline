import {Dispatch, Reducer} from "redux"
import {useDispatch, useSelector} from "react-redux"
import {StoreShape} from "./index"

export type TimeScaleState = {
    startDate: Date | number,
    dateZero: Date | number,
    timePerPixel: number,
    zoomCenter?: Date | number
}

const DefaultState: TimeScaleState = {
    startDate: 0,
    dateZero: 0,
    timePerPixel: 1
}


export let timeScale: Reducer<TimeScaleState> = (state, action) => {
    state = state || DefaultState

    switch (action.type) {
        case "setStartDate":
            return {
                ...state,
                startDate: action.payload
            }

        case "dragCanvas":
            return {
                ...state,
                startDate: state.startDate.valueOf() - action.payload * state.timePerPixel
            }

        case "setDateZero":
            return {
                ...state,
                dateZero: action.payload.valueOf()
            }

        case "setTimePerPixel":
            return {
                ...state,
                timePerPixel: action.payload
            }

        case "lockZoomCenter":
            let date = state.startDate.valueOf() + state.timePerPixel * action.payload
            return {
                ...state,
                zoomCenter: date
            }

        case "unlockZoomCenter":
            let {zoomCenter, ...nextState} = state
            return nextState

        case "zoom":
            if (state.zoomCenter) {
                let factor = action.payload
                let newTimePerPixel = state.timePerPixel * (1 + factor)
                let newStartDate = (state.timePerPixel - newTimePerPixel) * state.zoomCenter.valueOf() / state.timePerPixel + state.startDate.valueOf() * newTimePerPixel / state.timePerPixel
                return {
                    ...state,
                    timePerPixel: newTimePerPixel,
                    startDate: newStartDate
                }
            }
            return state

    }
    return state
}

export const useStartDate = () => useSelector<StoreShape, Date | number>(state => state.timeScale.startDate)

export const useDateZero = () => useSelector<StoreShape, Date | number>(state => state.timeScale.dateZero)

export const useTimePerPixel = () => useSelector<StoreShape, number>(state => state.timeScale.timePerPixel)

export const useEndDate = () => useSelector<StoreShape, Date | number>(state => {
    return state.timeScale.startDate.valueOf() + state.size.width * state.timeScale.timePerPixel
})

export const useZoomCenter = () => useSelector<StoreShape, number | Date | undefined>(state => state.timeScale.zoomCenter)


export const setStartDate = (dispatch: Dispatch, startDate: Date | number) => {
    dispatch({type: 'setStartDate', payload: startDate.valueOf()})
}

export const useSetStartDate = () => {
    let dispatch = useDispatch()
    return (startDate: Date | number) => {
        setStartDate(dispatch, startDate)
    }
}

export const setDateZero = (dispatch: Dispatch, dateZero: Date | number) => {
    dispatch({type: 'setDateZero', payload: dateZero.valueOf()})
}
export const useSetDateZero = () => {
    let dispatch = useDispatch()
    return (dateZero: Date | number) => {
        setDateZero(dispatch, dateZero)
    }
}

export const setTimePerPixel = (dispatch: Dispatch, timePerPixel: number) => {
    dispatch({type: 'setTimePerPixel', payload: timePerPixel})
}

export const useSetTimePerPixel = () => {
    let dispatch = useDispatch()
    return (timePerPixel: number) => {
        setTimePerPixel(dispatch, timePerPixel)
    }
}

export const dragCanvas = (dispatch: Dispatch, amount: number) => {
    dispatch({type: 'dragCanvas', payload: amount})
}

export const lockZoomCenter = (dispatch: Dispatch, x: number) => {
    dispatch({type: "lockZoomCenter", payload: x})
}

export const unlockZoomCenter = (dispatch: Dispatch) => {
    dispatch({type: "unlockZoomCenter"})
}

export const zoom = (dispatch: Dispatch, factor: number) => {
    dispatch({type: "zoom", payload: factor})
}


