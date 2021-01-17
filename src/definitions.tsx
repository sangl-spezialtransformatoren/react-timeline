import React, {createContext, RefObject} from 'react'
import {Dispatch as ReduxDispatch} from 'redux'
import {SpringConfig} from 'react-spring'
import {EventTypes, FullGestureState, Omit, StateKey} from 'react-use-gesture/dist/types'
import {DefaultTimelineContext} from './defaults'
import {BusinessLogic} from './store/businessLogic'
import {StoreShape} from './store/shape'

type EventState<T extends StateKey> = Omit<FullGestureState<StateKey<T>>, 'event'> & {event: EventTypes[T]}


export type TimelineProps = {
    timeZone?: string
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    animate?: boolean
    initialData?: {events: StoreShape['events'], groups: StoreShape['groups']}
    initialParameters?: InitialTimelineParameters
    style?: TimelineStyle,
    springConfig?: SpringConfig,
    config?: BusinessLogic,
    onCanvasDrag?: (props: {dispatch: ReduxDispatch, eventState: EventState<'drag'>}) => void
    onCanvasWheel?: (props: {dispatch: ReduxDispatch, svgRef: RefObject<SVGSVGElement> | undefined, eventState: EventState<'wheel'>}) => void
    onCanvasPinch?: (props: {dispatch: ReduxDispatch, svgRef: RefObject<SVGSVGElement> | undefined, eventState: EventState<'pinch'>}) => void
    onEventDrag?: (props: {dispatch: ReduxDispatch, eventState: EventState<'drag'>, id: any}) => void
    onEventDragStart?: (props: {dispatch: ReduxDispatch, eventState: EventState<'drag'>, id: any}) => void
    onEventDragEnd?: (props: {dispatch: ReduxDispatch, eventState: EventState<'drag'>, id: any}) => void
}

export type TimelineStyle = {
    width?: React.CSSProperties['width']
    height?: React.CSSProperties['height']
}

export type InitialTimelineParameters = {
    startDate: Date | number
    endDate: Date | number
}


export type TimelineContextShape = {
    onEventDrag: TimelineProps['onEventDrag']
    onEventDragStart: TimelineProps['onEventDragStart']
    onEventDragEnd: TimelineProps['onEventDragEnd']
}

export const DeprecatedTimelineContext = createContext<TimelineContextShape>(DefaultTimelineContext)