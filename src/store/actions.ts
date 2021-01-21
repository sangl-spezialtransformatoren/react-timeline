import {Action} from 'redux'

import {createPayloadActionCreators, PayloadAction} from './index'
import {RequiredEventData, StoreShape} from './shape'
import {makePureInterval, PureInterval} from './reducers/events'
import {ThunkAction} from '@reduxjs/toolkit'

// animate
export const SET_ANIMATE = 'setAnimate'
export type SetAnimateAction = PayloadAction<typeof SET_ANIMATE, boolean>
export const [setAnimate, useSetAnimate] = createPayloadActionCreators(SET_ANIMATE)

export type AnimateAction = SetAnimateAction


type ExternalEventData = Record<string, RequiredEventData>

// events
export const SET_EVENTS = 'setEvents'
export type SetEventsAction = PayloadAction<typeof SET_EVENTS, StoreShape['events']>
export const [setEvents, useSetEvents] = createPayloadActionCreators(SET_EVENTS, (events: ExternalEventData) => {
        return Object.fromEntries(
            Object.entries(events).map(
                ([key, event]) => [key, {
                    ...event,
                    interval: makePureInterval(event.interval),
                }]))
    },
)

export const UPDATE_EVENTS = 'updateEvents'
export type UpdateEventsAction = PayloadAction<typeof UPDATE_EVENTS, StoreShape['events']>
export const [updateEvents, useUpdateEvents] = createPayloadActionCreators(UPDATE_EVENTS, (events: ExternalEventData) => {
        return Object.fromEntries(
            Object.entries(events).map(
                ([key, event]) => [key, {
                    ...event,
                    interval: makePureInterval(event.interval),
                }]))
    },
)


export const MOVE_EVENT_INTERMEDIARY = 'moveEventIntermediary'
export type MoveEventIntermediaryAction = PayloadAction<typeof MOVE_EVENT_INTERMEDIARY, { id: string, interval: PureInterval }>
export const [moveEventIntermediary, useMoveEventIntermediary] = createPayloadActionCreators(MOVE_EVENT_INTERMEDIARY)

export const CHANGE_GROUP = 'changeGroup'
export type ChangeGroupAction = PayloadAction<typeof CHANGE_GROUP, { id: string, groupId: string }>
export const [changeGroup, useChangeGroup] = createPayloadActionCreators(CHANGE_GROUP)

export const RESET_DRAG_OR_RESIZE = 'resetDragOrResize'
export type ResetDragOrResizeAction = PayloadAction<typeof RESET_DRAG_OR_RESIZE, { id: string }>
export const [resetDragOrResize, useResetDragOrResize] = createPayloadActionCreators(RESET_DRAG_OR_RESIZE)

export const COMMIT_DRAG_OR_RESIZE = 'commitDragOrResize'
export type CommitDragOrResizeAction = PayloadAction<typeof COMMIT_DRAG_OR_RESIZE, { id: string }>
export const [commitDragOrResize, useCommitDragOrResize] = createPayloadActionCreators(COMMIT_DRAG_OR_RESIZE)

export type EventAction =
    SetEventsAction
    | ChangeGroupAction
    | ResetDragOrResizeAction
    | CommitDragOrResizeAction
    | MoveEventIntermediaryAction
    | UpdateEventsAction


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
export const unlockZoomCenter = () => {
    return {type: UNLOCK_ZOOM_CENTER}
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

export type Filter<A> = A extends { type: string, payload: any } ? A : never
export type PayloadActions = Filter<Actions>

export type Thunk = ThunkAction<void, StoreShape, any, Actions>