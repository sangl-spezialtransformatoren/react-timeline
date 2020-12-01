import React, {createContext, Dispatch, SetStateAction, useEffect, useState} from "react"
import {animated, useSpring} from 'react-spring'
import useResizeObserver from "use-resize-observer"
import './style.css'
import {useGesture} from "react-use-gesture"
import {State} from "react-use-gesture/dist/types"

export type TimelineStyle = {
    width?: React.CSSProperties["width"]
    height?: React.CSSProperties["height"]
}

export type TimelineProps = {
    state: TimelineState
    setState: Dispatch<SetStateAction<TimelineState>>
    initialParameters?: InitialTimelineParameters
    style?: TimelineStyle,
    onCanvasDrag?: (state: TimelineState, setState: Dispatch<SetStateAction<TimelineState>>, eventState: State['drag']) => void
}

const defaultOnCanvasDrag: TimelineProps["onCanvasDrag"] = (state, setState, eventState) => {
    console.log(eventState.movement)
    setState({
        ...state,
        startDate: state.initialStartDate.valueOf() - eventState.offset[0] * state.timePerPixel
    })
}

export type InitialTimelineParameters = {
    startDate: Date | number
    endDate: Date | number
}

export type TimelineState = {
    startDate: Date | number
    timePerPixel: number
    width: number
    initialStartDate: Date | number
    initialTimePerPixel: number
    initialParametersApplied: boolean
}

export const DefaultTimelineState: TimelineState = {
    startDate: new Date().valueOf(),
    timePerPixel: 1,
    width: 1,
    initialStartDate: new Date().valueOf(),
    initialTimePerPixel: 1,
    initialParametersApplied: false
}

export type TimelineContextShape = {
    dateZero: Date | number
    startDate: Date | number
    timePerPixel: number
    svgWidth: number

}
export const TimelineContext = createContext<TimelineContextShape>({
    dateZero: 0,
    startDate: 0,
    timePerPixel: 0,
    svgWidth: 1
})

export const useTimelineState = (initialState: TimelineState = DefaultTimelineState) => {
    return useState<TimelineState>(initialState)
}

export const Timeline: React.FC<TimelineProps> = (
    {
        children,
        style,
        state,
        setState,
        initialParameters,
        onCanvasDrag = defaultOnCanvasDrag
    }) => {
    const {ref, width, height} = useResizeObserver<HTMLDivElement>()
    let {initialParametersApplied, startDate, timePerPixel, initialStartDate} = state

    let [{x}] = useSpring(
        () => ({
            x: (startDate.valueOf() - initialStartDate.valueOf()) / timePerPixel,
            config: {mass: 0.5, tension: 210, friction: 25}
        }), [startDate])
    let viewBox = x.to(x => `${x} 0 ${width} ${height}`)

    useEffect(() => {
        if ((!initialParametersApplied) && width) {
            let startDate = initialParameters?.startDate || new Date().valueOf()
            let endDate = initialParameters?.endDate || new Date().valueOf() + 24 * 3600 * 1000
            let timePerPixel = (endDate.valueOf() - startDate.valueOf()) / width

            setState({
                ...state,
                startDate: startDate,
                timePerPixel: timePerPixel,
                initialStartDate: startDate,
                initialTimePerPixel: timePerPixel,
                initialParametersApplied: true
            })
        }
    }, [initialParameters, initialParametersApplied, width])

    const bind = useGesture({
        onDrag: eventState => onCanvasDrag(state, setState, eventState),
        onWheel: ({offset: [_, dy]}) => console.log(dy)
    })

    return <TimelineContext.Provider
        value={{
            dateZero: state.initialStartDate,
            startDate: startDate,
            timePerPixel: state.timePerPixel || 1,
            svgWidth: width || 1
        }}>
        <div className={"react-timeline"} style={style} ref={ref}>
            <animated.svg
                {...bind()}
                viewBox={viewBox}
                className={"react-timeline-svg"}
            >
                {children}
            </animated.svg>
        </div>
    </TimelineContext.Provider>
}