import {config, SpringValue} from 'react-spring'
import {TimelineContextShape, TimelineProps} from './definitions'
import {
    dragCanvas,
    dragEvent,
    dragEventEnd,
    dragEventStart,
    lockZoomCenter,
    stopEventDrag,
    stopEventEndDrag,
    stopEventStartDrag,
    unlockZoomCenter,
    zoom,
} from './store/actions'
import {DefaultConfig} from './store/config'


export function SpringConstant<T>() {
    return new SpringValue<T>()
}


export const DefaultTimelineContext: TimelineContextShape = {
    onEventDrag: () => null,
    onEventDragEnd: () => null,
    onEventDragStart: () => null,
}

export const defaultOnCanvasDrag: TimelineProps['onCanvasDrag'] = ({dispatch, eventState}) => {
    let {pinching} = eventState
    if (!pinching) {
        dragCanvas(dispatch, eventState.delta[0])
    }
}

export const defaultOnCanvasWheel: TimelineProps['onCanvasWheel'] = ({dispatch, svgRef, eventState}) => {
    let svg = svgRef?.current
    if (svg !== undefined && svg !== null) {
        let point = svg.createSVGPoint()
        point.x = eventState.event.clientX
        point.y = eventState.event.clientY
        let x = point.matrixTransform(svg.getScreenCTM()?.inverse()).x

        let {delta} = eventState
        let factor = 1 + Math.sign(delta[1]) * 0.002 * Math.min(Math.abs(delta[1]), 50)

        if (eventState.first) {
            lockZoomCenter(dispatch, x)
        }
        if (eventState.last) {
            unlockZoomCenter(dispatch)
        } else {
            zoom(dispatch, factor)
        }
    }
}

export const defaultOnCanvasPinch: TimelineProps['onCanvasPinch'] = ({dispatch, svgRef, eventState}) => {
    let svg = svgRef?.current
    if (svg !== undefined && svg !== null) {

        let point = svg.createSVGPoint()
        point.x = eventState.origin[0]
        point.y = eventState.origin[1]
        let x = point.matrixTransform(svg.getScreenCTM()?.inverse()).x

        let {previous, da, first} = eventState
        let factor: number
        if (!first) {
            factor = previous[0] / da[0]
        } else {
            factor = 1
        }

        if (eventState.first) {
            lockZoomCenter(dispatch, x)
        }
        if (eventState.last) {
            unlockZoomCenter(dispatch)
        } else {
            zoom(dispatch, factor)
        }
    }
}

export const defaultOnEventDrag: TimelineProps['onEventDrag'] = ({dispatch, eventState, id}) => {
    eventState.event.stopPropagation()
    let {movement: [dx], last} = eventState

    dragEvent(dispatch, {id, pixels: dx})

    if (last) {
        stopEventDrag(dispatch, {id})
    }

}

export const defaultOnEventDragStart: TimelineProps['onEventDragStart'] = ({eventState, dispatch, id}) => {
    eventState.event.stopPropagation()

    let {movement: [dx], last} = eventState

    dragEventStart(dispatch, {id, pixels: dx})

    if (last) {
        stopEventStartDrag(dispatch, {id})
    }
}

export const defaultOnEventDragEnd: TimelineProps['onEventDragEnd'] = ({eventState, dispatch, id}) => {
    eventState.event.stopPropagation()

    let {movement: [dx], last} = eventState

    dragEventEnd(dispatch, {id, pixels: dx})

    if (last) {
        stopEventEndDrag(dispatch, {id})
    }
}


export const DefaultTimelineProps: Partial<TimelineProps> = {
    animate: true,
    timeZone: 'Etc/UTC',
    weekStartsOn: 1,
    config: DefaultConfig,
    onCanvasDrag: defaultOnCanvasDrag,
    onCanvasWheel: defaultOnCanvasWheel,
    onCanvasPinch: defaultOnCanvasPinch,
    onEventDrag: defaultOnEventDrag,
    onEventDragEnd: defaultOnEventDragEnd,
    onEventDragStart: defaultOnEventDragStart,
    springConfig: config.stiff,
}