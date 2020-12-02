import React, {createContext, Dispatch, RefObject, SetStateAction} from "react"
import {SpringConfig} from "react-spring"
import {EventTypes, FullGestureState, Omit, StateKey} from "react-use-gesture/dist/types"
import {DefaultTimelineContext} from "./defaults"

type EventState<T extends StateKey> = Omit<FullGestureState<StateKey<T>>, 'event'> & { event: EventTypes[T] }

export type TimelineProps = {
    state: TimelineState
    setState: Dispatch<SetStateAction<TimelineState>>
    initialParameters?: InitialTimelineParameters
    style?: TimelineStyle,
    sprintConfig?: SpringConfig,
    onCanvasDrag?: (props: { state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'drag'> }) => void
    onCanvasWheel?: (props: { state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: EventState<'wheel'> }) => void
}

export type TimelineStyle = {
    width?: React.CSSProperties["width"]
    height?: React.CSSProperties["height"]
}

export type InitialTimelineParameters = {
    startDate: Date | number
    endDate: Date | number
}

export type TimelineState = {
    startDate: Date | number
    timePerPixel: number
    dateZero: Date | number
    initialTimePerPixel: number
    initialParametersApplied: boolean
    svg: RefObject<SVGSVGElement> | undefined
    wheelingCenter: Date | number | undefined
}

export type TimelineContextShape = {
    dateZero: Date | number
    startDate: Date | number
    timePerPixel: number
    svgWidth: number,
    springConfig: SpringConfig
    initialized: boolean
}

export const TimelineContext = createContext<TimelineContextShape>(DefaultTimelineContext)