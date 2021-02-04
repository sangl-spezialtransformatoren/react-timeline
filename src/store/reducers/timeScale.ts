import {PartialTimelineReducer} from '../index'
import {
    DRAG_CANVAS,
    LOCK_ZOOM_CENTER,
    SET_DATE_ZERO,
    SET_START_DATE,
    SET_TIME_PER_PIXEL,
    UNLOCK_ZOOM_CENTER,
    ZOOM,
} from '../actions'
import {StoreShape} from '../shape'


const DefaultState: StoreShape['timeScale'] = {
    startDate: 0,
    dateZero: 0,
    timePerPixel: 1,
    zoomCenter: 0,
}

export const timeScale: PartialTimelineReducer<'timeScale'> = () => (state, action) => {
    let timeScaleState = state?.timeScale || DefaultState
    let startDate = timeScaleState.startDate.valueOf()
    let timePerPixel = timeScaleState.timePerPixel
    let zoomCenter = timeScaleState.zoomCenter
    let dateZero = timeScaleState.dateZero.valueOf()
    let width = state?.size.width

    if (width !== undefined && startDate && dateZero !== undefined && timePerPixel !== undefined) {
        if (Math.abs(startDate - dateZero) > 2 * Math.abs(width * timePerPixel)) {
            timeScaleState = {
                ...timeScaleState,
                dateZero: startDate + width * timePerPixel / 2,
            }
        }
    }

    switch (action.type) {
        case SET_START_DATE: {
            timeScaleState = {
                ...timeScaleState,
                startDate: action.payload.valueOf(),
            }
            break
        }
        case DRAG_CANVAS: {
            timeScaleState = {
                ...timeScaleState,
                startDate: startDate.valueOf() - action.payload.x * timePerPixel,
            }
            break
        }
        case SET_DATE_ZERO: {
            timeScaleState = {
                ...timeScaleState,
                dateZero: action.payload.valueOf(),
            }
            break
        }
        case SET_TIME_PER_PIXEL: {
            timeScaleState = {
                ...timeScaleState,
                timePerPixel: action.payload,
            }
            break
        }
        case LOCK_ZOOM_CENTER: {
            let date = startDate.valueOf() + timePerPixel * action.payload
            timeScaleState = {
                ...timeScaleState,
                zoomCenter: date,
            }
            break
        }
        case UNLOCK_ZOOM_CENTER: {
            let {zoomCenter: _, ...nextState} = timeScaleState
            timeScaleState = nextState
            break
        }
        case ZOOM: {
            if (zoomCenter) {
                if (state?.size.width) {
                    let factor = action.payload
                    let newTimePerPixel = timePerPixel * factor
                    let newStartDate = (timePerPixel - newTimePerPixel) * zoomCenter.valueOf() / timePerPixel + startDate.valueOf() * newTimePerPixel / timePerPixel
                    let newEndDate = newStartDate + state.size.width * timePerPixel
                    if (((newTimePerPixel > timePerPixel) && (newEndDate - newStartDate < 1.0e+12)) || ((newTimePerPixel < timePerPixel) && (newEndDate - newStartDate) > 300000)) {
                        timeScaleState = {
                            ...timeScaleState,
                            timePerPixel: newTimePerPixel,
                            startDate: newStartDate,
                        }
                    }
                }
            }
            break
        }
    }
    return timeScaleState
}
