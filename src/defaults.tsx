import {TimelineContextShape, TimelineProps, TimelineState} from "./definitions"
import {config} from "react-spring"

export const DefaultTimelineState: TimelineState = {
    startDate: new Date().valueOf(),
    timePerPixel: 1,
    dateZero: new Date().valueOf(),
    initialTimePerPixel: 1,
    initialParametersApplied: false,
    svg: undefined,
    wheelingCenter: undefined
}

export const DefaultTimelineContext: TimelineContextShape = {
    dateZero: 0,
    startDate: 0,
    timePerPixel: 0,
    svgWidth: 1,
    springConfig: config.stiff,
    initialized: false
}

export const defaultOnCanvasDrag: TimelineProps["onCanvasDrag"] = ({state, setState, eventState}) => {
    setState({
        ...state,
        startDate: state.startDate.valueOf() - eventState.delta[0] * state.timePerPixel
    })
}

export const defaultOnCanvasWheel: TimelineProps["onCanvasWheel"] = ({state, eventState, setState}) => {
    let svg = state.svg?.current
    if (svg !== undefined && svg !== null) {
        let {timePerPixel, dateZero, startDate, wheelingCenter} = state
        let dateOfMouse
        if (state.wheelingCenter !== undefined) {
            dateOfMouse = wheelingCenter
        } else {
            let point = svg.createSVGPoint()
            point.x = eventState.event.clientX
            point.y = eventState.event.clientY
            let pos = point.matrixTransform(svg.getScreenCTM()?.inverse())
            dateOfMouse = dateZero.valueOf() + timePerPixel * pos.x
        }
        let factor = 0.002
        let {delta} = eventState
        let newTimePerPixel = timePerPixel * (1 + factor * delta[1])
        let newStartDate = (timePerPixel - newTimePerPixel) * dateOfMouse!.valueOf() / timePerPixel + startDate.valueOf() * newTimePerPixel / timePerPixel
        setState({
            ...state,
            timePerPixel: newTimePerPixel,
            startDate: newStartDate,
            wheelingCenter: eventState.last ? undefined : dateOfMouse
        })
    }
}
