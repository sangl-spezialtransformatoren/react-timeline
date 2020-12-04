import React, {createContext, Dispatch, RefObject, SetStateAction} from 'react'
import {SpringConfig} from 'react-spring'
import {EventTypes, FullGestureState, Omit, StateKey} from 'react-use-gesture/dist/types'
import {DefaultTimelineContext} from './defaults'

type EventState<T extends StateKey> = Omit<FullGestureState<StateKey<T>>, 'event'> & { event: EventTypes[T] }

export type TimelineEvent = {
    interval: Interval
    label?: string
    payload?: any
    group?: string
}

export type TimelineData = {
    events: { [id: string]: TimelineEvent }
    groups?: Array<string>
}

export type TimelineProps = {
    state: TimelineState
    setState: Dispatch<SetStateAction<TimelineState>>
    initialParameters?: InitialTimelineParameters
    style?: TimelineStyle,
    sprintConfig?: SpringConfig,
    onCanvasDrag?: (props: { state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'drag'> }) => void
    onCanvasWheel?: (props: { state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'wheel'> }) => void
    onCanvasPinch?: (props: { state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'pinch'> }) => void
    onEventDrag?: (props: { state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'drag'>, id: any }) => void
    onEventDragStart?: (props: { state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'drag'>, id: any }) => void
    onEventDragEnd?: (props: { state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'drag'>, id: any }) => void
}

export type TimelineStyle = {
    width?: React.CSSProperties['width']
    height?: React.CSSProperties['height']
}

export type InitialTimelineParameters = {
    startDate: Date | number
    endDate: Date | number
}

export type InternalTimelineState = {
    svg: RefObject<SVGSVGElement> | undefined
    initialized: boolean
    wheelingCenter: Date | number | undefined
    animatedData: Partial<TimelineData>
}

export type TimelineState = {
    internal: InternalTimelineState
    startDate: Date | number
    timePerPixel: number
    data?: TimelineData
}

export type TimelineContextShape = {
    startDate: Date | number
    endDate: Date | number
    timePerPixel: number
    svgWidth: number,
    springConfig: SpringConfig
    initialized: boolean
    onEventDrag: TimelineProps['onEventDrag']
    onEventDragStart: TimelineProps['onEventDragStart']
    onEventDragEnd: TimelineProps['onEventDragEnd']
    state: TimelineState,
    setState: Dispatch<SetStateAction<TimelineState>>
}

export const TimelineContext = createContext<TimelineContextShape>(DefaultTimelineContext)