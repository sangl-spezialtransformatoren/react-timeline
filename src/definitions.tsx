import React, {createContext, Dispatch, RefObject, SetStateAction} from 'react'
import {Dispatch as ReduxDispatch} from "redux"
import {SpringConfig, SpringValue} from 'react-spring'
import {EventTypes, FullGestureState, Omit, StateKey} from 'react-use-gesture/dist/types'
import {DefaultTimelineContext} from './defaults'

type EventState<T extends StateKey> = Omit<FullGestureState<StateKey<T>>, 'event'> & { event: EventTypes[T] }

export type TimelineEvent = {
    interval: Interval
    label?: string
    payload?: any
    group?: string
    manipulated?: boolean
}

export type TimelineData = {
    events: Record<string, TimelineEvent>
    groups?: Array<string>
}

export type TimelineProps = {
    state: TimelineState
    setState: Dispatch<SetStateAction<TimelineState>>
    timeZone?: string
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    animate?: boolean
    initialParameters?: InitialTimelineParameters
    style?: TimelineStyle,
    springConfig?: SpringConfig,
    onCanvasDrag?: (props: { dispatch?: ReduxDispatch, state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'drag'> }) => void
    onCanvasWheel?: (props: { dispatch?: ReduxDispatch, svgRef: RefObject<SVGSVGElement> | undefined, state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'wheel'> }) => void
    onCanvasPinch?: (props: { dispatch?: ReduxDispatch, svgRef: RefObject<SVGSVGElement> | undefined, state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'pinch'> }) => void
    onEventDrag?: (props: { dispatch?: ReduxDispatch, state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'drag'>, id: any }) => void
    onEventDragStart?: (props: { dispatch?: ReduxDispatch, state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'drag'>, id: any }) => void
    onEventDragEnd?: (props: { dispatch?: ReduxDispatch, state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'drag'>, id: any }) => void
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
    dateZero: Date | number
}

export type TimelineState = {
    internal: InternalTimelineState
    startDate: Date | number
    timePerPixel: number
    data?: TimelineData
}

export type TimelineContextShape = {
    startDateSpring: SpringValue<number | Date>
    endDateSpring: SpringValue<number | Date>
    timePerPixelSpring: SpringValue<number>
    svgWidth: number,
    onEventDrag: TimelineProps['onEventDrag']
    onEventDragStart: TimelineProps['onEventDragStart']
    onEventDragEnd: TimelineProps['onEventDragEnd']
    state: TimelineState,
    setState: Dispatch<SetStateAction<TimelineState>>
}

export const TimelineContext = createContext<TimelineContextShape>(DefaultTimelineContext)