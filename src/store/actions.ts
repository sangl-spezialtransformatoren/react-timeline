import {Action} from 'redux'

import {createPayloadActionCreators, PayloadAction} from './index'
import {RequiredEventData, RequiredGroupData, StoreShape} from './shape'
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

export const MERGE_NEW_EVENT_DATA = 'mergeNewEventData'
export type MergeNewEventDataAction = PayloadAction<typeof MERGE_NEW_EVENT_DATA, StoreShape['events']>
export const [mergeNewEventData, useMergeNewEventData] = createPayloadActionCreators(MERGE_NEW_EVENT_DATA, (events: ExternalEventData) => {
        return Object.fromEntries(
            Object.entries(events).map(
                ([key, event]) => [key, {
                    ...event,
                    interval: makePureInterval(event.interval),
                }]))
    },
)


export const MOVE_EVENT_INTERMEDIARY = 'moveEventIntermediary'
export type MoveEventIntermediaryAction = PayloadAction<typeof MOVE_EVENT_INTERMEDIARY, {id: string, interval: PureInterval}>
export const [moveEventIntermediary, useMoveEventIntermediary] = createPayloadActionCreators(MOVE_EVENT_INTERMEDIARY)

export const UPDATE_EVENTS = 'updateEvents'
export type UpdateEventsAction<E extends RequiredEventData = RequiredEventData> = PayloadAction<typeof UPDATE_EVENTS, {updatedEvents?: Record<string, E>, deletedEvents?: string[]}>
export const [updateEvents, useUpdateEvents] = createPayloadActionCreators(UPDATE_EVENTS)

export const UPDATE_EVENTS_INTERMEDIARY = 'updateEventsIntermediary'
export type UpdateEventsIntermediaryAction<E extends RequiredEventData = RequiredEventData> = PayloadAction<typeof UPDATE_EVENTS_INTERMEDIARY, {updatedEvents?: Record<string, E>, deletedEvents?: string[]}>
export const [updateEventsIntermediary, useUpdateEventsIntermediary] = createPayloadActionCreators(UPDATE_EVENTS_INTERMEDIARY)

export const UPDATE_GROUPS = 'updateGroups'
export type UpdateGroupsAction<G extends RequiredGroupData = RequiredGroupData> = PayloadAction<typeof UPDATE_GROUPS, {updatedGroups?: Record<string, G>, deletedGroups?: string[]}>
export const [updateGroups, useUpdateGroups] = createPayloadActionCreators(UPDATE_GROUPS)

export const UPDATE_GROUPS_INTERMEDIARY = 'updateGroupsIntermediary'
export type UpdateGroupsIntermediaryAction<G extends RequiredGroupData = RequiredGroupData> = PayloadAction<typeof UPDATE_GROUPS_INTERMEDIARY, {updatedGroups?: Record<string, G>, deletedGroups?: string[]}>
export const [updateGroupsIntermediary, useUpdateGroupsIntermediary] = createPayloadActionCreators(UPDATE_GROUPS_INTERMEDIARY)

export const CHANGE_GROUP = 'changeGroup'
export type ChangeGroupAction = PayloadAction<typeof CHANGE_GROUP, {id: string, groupId: string}>
export const [changeGroup, useChangeGroup] = createPayloadActionCreators(CHANGE_GROUP)

export const RESET_DRAG_OR_RESIZE = 'resetDragOrResize'
export type ResetDragOrResizeAction = Action<typeof RESET_DRAG_OR_RESIZE>
export const resetDragOrResize = () => {
    return {type: RESET_DRAG_OR_RESIZE} as ResetDragOrResizeAction
}

export const TOGGLE_EVENT_SELECTED = 'toggleEventSelected'
export type ToggleEventSelectedAction = PayloadAction<typeof TOGGLE_EVENT_SELECTED, {id: string}>
export const [toggleEventSelection, useToggleEventSelection] = createPayloadActionCreators(TOGGLE_EVENT_SELECTED)

export const DESELECT_ALL_EVENTS = 'deselectAllEvents'
export type DeselectAllEventsAction = Action<typeof DESELECT_ALL_EVENTS>
export const deselectAllEvents = () => {
    return {type: DESELECT_ALL_EVENTS}
}

export type EventAction<E extends RequiredEventData = RequiredEventData, G extends RequiredGroupData = RequiredGroupData> =
    SetEventsAction
    | ChangeGroupAction
    | ResetDragOrResizeAction
    | MoveEventIntermediaryAction
    | MergeNewEventDataAction
    | ToggleEventSelectedAction
    | UpdateEventsAction<E>
    | UpdateEventsIntermediaryAction<E>
    | UpdateGroupsAction<G>
    | UpdateGroupsIntermediaryAction<G>
    | DeselectAllEventsAction

// groups
export const SET_GROUP_POSITION = 'setGroupPosition'
export type SetGroupPositionAction = PayloadAction<typeof SET_GROUP_POSITION, {groupId: string, x: number, y: number, width: number, height: number}>
export const [setGroupPosition, useSetGroupPosition] = createPayloadActionCreators(SET_GROUP_POSITION)

export const MERGE_NEW_GROUP_DATA = 'mergeNewGroupData'
export type MergeNewGroupDataAction = PayloadAction<typeof MERGE_NEW_GROUP_DATA, StoreShape['groups']>
export const [mergeNewGroupData, useMergeNewGroupData] = createPayloadActionCreators(MERGE_NEW_GROUP_DATA)

export type GroupAction = SetGroupPositionAction | MergeNewGroupDataAction

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
export type DragCanvasAction = PayloadAction<typeof DRAG_CANVAS, {x: number, y: number, applyBounds?: boolean}>
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

// presentational
export const SET_HEADER_HEIGHT = 'setHeaderHeight'
export type SetHeaderHeightAction = PayloadAction<typeof SET_HEADER_HEIGHT, number>
export const [setHeaderHeight, useSetHeaderHeight] = createPayloadActionCreators(SET_HEADER_HEIGHT)

export const SET_SCROLL_OFFSET = 'setScrollOffset'
export type SetScrollOffsetAction = PayloadAction<typeof SET_SCROLL_OFFSET, number>
export const [setScrollOffset, useSetScrollOffset] = createPayloadActionCreators(SET_SCROLL_OFFSET)

export const SET_CONTENT_HEIGHT = 'setContentHeight'
export type SetContentHeightAction = PayloadAction<typeof SET_CONTENT_HEIGHT, number>
export const [setContentHeight, useSetContentHeight] = createPayloadActionCreators(SET_CONTENT_HEIGHT)

export const OPEN_DRAWER = 'openDrawer'
export type OpenDrawerAction = Action<typeof OPEN_DRAWER>
export const openDrawer = () => {
    return {type: OPEN_DRAWER}
}

export const CLOSE_DRAWER = 'closeDrawer'
export type CloseDrawerAction = Action<typeof CLOSE_DRAWER>
export const closeDrawer = () => {
    return {type: CLOSE_DRAWER}
}

export const SET_DRAWER_WIDTH = 'setDrawerWidth'
export type SetDrawerWidthAction = PayloadAction<typeof SET_DRAWER_WIDTH, number>
export const [setDrawerWidth, useSetDrawerWidth] = createPayloadActionCreators(SET_DRAWER_WIDTH)

export const SET_LAYOUT_PARAMETERS = 'setLayoutParameters'
export type SetLayoutParametersAction = PayloadAction<typeof SET_LAYOUT_PARAMETERS, {
    eventHeight?: number,
    eventSpacing?: number,
    groupPadding?: number,
    minGroupHeight?: number
}>
export const [setLayoutParameters, useSetLayoutParameters] = createPayloadActionCreators(SET_LAYOUT_PARAMETERS)


export type PresentationalAction =
    SetHeaderHeightAction
    | SetScrollOffsetAction
    | SetContentHeightAction
    | OpenDrawerAction
    | CloseDrawerAction
    | SetLayoutParametersAction
    | SetDrawerWidthAction

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
    | PresentationalAction
    | GroupAction

export type Filter<A> = A extends {type: string, payload: any} ? A : never
export type PayloadActions = Filter<Actions>

export type Thunk = ThunkAction<void, StoreShape, any, Actions>