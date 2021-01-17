import {Action} from 'redux'

import {createPayloadActionCreators, Dispatch, PayloadAction} from './index'
import {StoreShape} from './shape'
import {makePureInterval} from './reducers/events'

// animate
export const SET_ANIMATE = 'setAnimate'
export type SetAnimateAction = PayloadAction<typeof SET_ANIMATE, boolean>
export const [setAnimate, useSetAnimate] = createPayloadActionCreators(SET_ANIMATE)

export type AnimateAction = SetAnimateAction


// events
export const SET_EVENTS = 'setEvents'
export type SetEventsAction = PayloadAction<typeof SET_EVENTS, StoreShape['events']>
export const [setEvents, useSetEvents] = createPayloadActionCreators(SET_EVENTS, (events: StoreShape['events']) => {
        return Object.fromEntries(
            Object.entries(events).map(
                ([key, event]) => [key, {
                    ...event,
                    interval: makePureInterval(event.interval),
                }]))
    },
)

export const DRAG_EVENT = 'dragEvent'
export type DragEventAction = PayloadAction<typeof DRAG_EVENT, {id: string, pixels: number}>
export const [dragEvent, useDragEvent] = createPayloadActionCreators(DRAG_EVENT)

export const DRAG_EVENT_START = 'dragEventStart'
export type DragEventStartAction = PayloadAction<typeof DRAG_EVENT_START, {id: string, pixels: number}>
export const [dragEventStart, useDragEventStart] = createPayloadActionCreators(DRAG_EVENT_START)

export const DRAG_EVENT_END = 'dragEventEnd'
export type DragEventEndAction = PayloadAction<typeof DRAG_EVENT_END, {id: string, pixels: number}>
export const [dragEventEnd, useDragEventEnd] = createPayloadActionCreators(DRAG_EVENT_END)

export const STOP_EVENT_DRAG = 'stopEventDrag'
export type StopEventDragAction = PayloadAction<typeof STOP_EVENT_DRAG, {id: string}>
export const [stopEventDrag, useStopEventDrag] = createPayloadActionCreators(STOP_EVENT_DRAG)

export const STOP_EVENT_START_DRAG = 'stopEventStartDrag'
export type StopEventStartDragAction = PayloadAction<typeof STOP_EVENT_START_DRAG, {id: string}>
export const [stopEventStartDrag, useStopEventStartDrag] = createPayloadActionCreators(STOP_EVENT_START_DRAG)

export const STOP_EVENT_END_DRAG = 'stopEventEndDrag'
export type StopEventEndDragAction = PayloadAction<typeof STOP_EVENT_END_DRAG, {id: string}>
export const [stopEventEndDrag, useStopEventEndDrag] = createPayloadActionCreators(STOP_EVENT_END_DRAG)

export type EventAction =
    SetEventsAction
    | DragEventAction
    | DragEventStartAction
    | DragEventEndAction
    | StopEventDragAction
    | StopEventStartDragAction
    | StopEventEndDragAction


// initialized
export const SET_INITIALIZED = 'setInitialized'
export type SetInitializedAction = PayloadAction<typeof SET_INITIALIZED, boolean>
export const [setInitialized, useSetInitialized] = createPayloadActionCreators(SET_INITIALIZED)

export type InitializedAction = SetInitializedAction

// size
export const SET_SIZE = 'setSize'
export type SetSizeAction = PayloadAction<typeof SET_SIZE, StoreShape['size']>
export const [setSize, useSetSize] = createPayloadActionCreators(SET_SIZE)

export type SizeAction = SetSizeAction

// springConfig
export const SET_SPRING_CONFIG = 'setSpringConfig'
export type SetSpringConfigAction = PayloadAction<typeof SET_SPRING_CONFIG, any>
export const [setSpringConfig, useSetSpringConfig] = createPayloadActionCreators(SET_SPRING_CONFIG)

export type SpringConfigAction = SetSpringConfigAction

// timeScale
export const SET_START_DATE = 'setStartDate'
export type SetStartDateAction = PayloadAction<typeof SET_START_DATE, Date | number>
export const [setStartDate, useSetStartDate] = createPayloadActionCreators(SET_START_DATE, data => data.valueOf())

export const SET_DATE_ZERO = 'setDateZero'
export type SetDateZeroAction = PayloadAction<typeof SET_DATE_ZERO, Date | number>
export const [setDateZero, useSetDateZero] = createPayloadActionCreators(SET_DATE_ZERO, data => data.valueOf())

export const DRAG_CANVAS = 'dragCanvas'
export type DragCanvasAction = PayloadAction<typeof DRAG_CANVAS, number>
export const [dragCanvas, useDragCanvas] = createPayloadActionCreators(DRAG_CANVAS)

export const SET_TIME_PER_PIXEL = 'setTimePerPixel'
export type SetTimePerPixelAction = PayloadAction<typeof SET_TIME_PER_PIXEL, number>
export const [setTimePerPixel, useSetTimePerPixel] = createPayloadActionCreators(SET_TIME_PER_PIXEL)

export const LOCK_ZOOM_CENTER = 'lockZoomCenter'
export type LockZoomCenterAction = PayloadAction<typeof LOCK_ZOOM_CENTER, number>
export const [lockZoomCenter, useLockZoomCenter] = createPayloadActionCreators(LOCK_ZOOM_CENTER)

export const UNLOCK_ZOOM_CENTER = 'unlockZoomCenter'
export type UnlockZoomCenterAction = Action<typeof UNLOCK_ZOOM_CENTER>
export const unlockZoomCenter = (dispatch: Dispatch) => {
    dispatch({type: UNLOCK_ZOOM_CENTER})
}

export const ZOOM = 'zoom'
export type ZoomAction = PayloadAction<typeof ZOOM, number>
export const [zoom, useZoom] = createPayloadActionCreators(ZOOM)

export type TimeScaleAction =
    SetStartDateAction
    | SetDateZeroAction
    | DragCanvasAction
    | SetTimePerPixelAction
    | LockZoomCenterAction
    | UnlockZoomCenterAction
    | ZoomAction


// timeZone
export const SET_TIME_ZONE = 'setTimeZone'
export type SetTimeZoneAction = PayloadAction<typeof SET_TIME_ZONE, string>
export const [setTimeZone, useSetTimeZone] = createPayloadActionCreators(SET_TIME_ZONE)

export type TimeZoneAction = SetTimeZoneAction

// weekStartsOn
export const SET_WEEK_STARTS_ON = 'setWeekStartsOn'
export type SetWeekStartsOnAction = PayloadAction<typeof SET_WEEK_STARTS_ON, StoreShape['weekStartsOn']>
export const [setWeekStartsOn, useSetWeekStartsOn] = createPayloadActionCreators(SET_WEEK_STARTS_ON)

export type WeekStartsOnAction = SetWeekStartsOnAction


// All actions
export type Actions =
    AnimateAction
    | EventAction
    | InitializedAction
    | SizeAction
    | TimeScaleAction
    | SetTimeZoneAction
    | WeekStartsOnAction
    | SpringConfigAction

export type Filter<A> = A extends {type: string, payload: any} ? A : never
export type PayloadActions = Filter<Actions>