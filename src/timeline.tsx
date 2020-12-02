import React, {useEffect, useRef, useState} from "react"
import {animated, useSpring, config} from 'react-spring'
import useResizeObserver from "use-resize-observer"
import './style.css'
import {useGesture} from "react-use-gesture"
import {defaultOnCanvasDrag, defaultOnCanvasWheel, DefaultTimelineState} from "./defaults"
import {TimelineContext, TimelineProps, TimelineState} from "./definitions"

export const useTimelineState = (initialState: TimelineState = DefaultTimelineState) => {
    return useState<TimelineState>(initialState)
}

export const Timeline: React.FC<TimelineProps> = (props) => {
    let {children, style, state, setState, initialParameters, onCanvasDrag = defaultOnCanvasDrag, onCanvasWheel = defaultOnCanvasWheel, sprintConfig = { mass: 1, tension: 210, friction: 20.1 }} = props
    let {initialParametersApplied, startDate, timePerPixel, dateZero} = state

    const {ref, width, height} = useResizeObserver<HTMLDivElement>()
    let svgRef = useRef<SVGSVGElement>(null)

    let {x} = useSpring({
        x: (startDate.valueOf() - dateZero.valueOf()) / timePerPixel,
        config: sprintConfig
    })
    let viewBox = x.to(x => `${x} 0 ${width} ${height}`)

    let [date] = useState<Date>(new Date())

    useEffect(() => {
        if ((!initialParametersApplied) && width) {
            let startDate = initialParameters?.startDate || new Date().valueOf()
            let endDate = initialParameters?.endDate || new Date().valueOf() + 24 * 3600 * 1000
            let timePerPixel = (endDate.valueOf() - startDate.valueOf()) / width

            setState({
                ...state,
                startDate: startDate,
                timePerPixel: timePerPixel,
                dateZero: startDate,
                initialTimePerPixel: timePerPixel,
                initialParametersApplied: true
            })
        }
    }, [initialParameters, initialParametersApplied, width])

    useEffect(() => {
        setState({...state, svg: svgRef})
    }, [svgRef])

    const bind = useGesture({
        onDrag: eventState => onCanvasDrag?.({state, setState, eventState}),
        onWheel: eventState => onCanvasWheel?.({state, setState, eventState})
    })

    return <TimelineContext.Provider
        value={{
            dateZero: state.dateZero,
            startDate: startDate,
            timePerPixel: state.timePerPixel || 1,
            svgWidth: width || 1,
            springConfig: config.stiff,
            initialized: state.initialParametersApplied
        }}>
        <div className={"react-timeline"} style={style} ref={ref}>
            <animated.svg
                {...bind()}
                viewBox={viewBox}
                className={"react-timeline-svg"}
                ref={svgRef}
            >
                {state.initialParametersApplied && children}
                <rect x={(date.valueOf() - dateZero.valueOf())/timePerPixel} y={0} fill={"black"} width={2 * 3600 * 1000 / timePerPixel} height={50}/>
                <rect x={(date.valueOf() + 3 * 3600 * 1000 - dateZero.valueOf())/timePerPixel} y={0} fill={"gray"} width={2 * 3600 * 1000 / timePerPixel}
                      height={50}/>
                <foreignObject x={(date.valueOf() + 3 * 3600 * 1000 - dateZero.valueOf())/timePerPixel} y={0} width={2 * 3600 * 1000 / timePerPixel}
                               height={50}>
                    <div>
                        Test
                    </div>
                </foreignObject>
                <rect x={(date.valueOf() + 3 * 3600 *365*5 * 1000 - dateZero.valueOf())/timePerPixel} y={0} fill={"gray"} width={2 * 3600 * 1000 / timePerPixel}
                      height={50}/>
            </animated.svg>
        </div>
    </TimelineContext.Provider>
}