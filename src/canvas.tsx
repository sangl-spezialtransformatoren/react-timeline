import React, {RefObject, useEffect, useRef} from 'react'
import useResizeObserver from 'use-resize-observer'
import {useGesture} from 'react-use-gesture'
import {animated} from 'react-spring'
import {Dispatch as ReduxDispatch} from 'redux'
import {shallowEqual, useDispatch} from 'react-redux'
import {EventTypes, FullGestureState, Omit, StateKey} from 'react-use-gesture/dist/types'

import {TimelineProps} from './definitions'
import {
    dragCanvas,
    lockZoomCenter,
    unlockZoomCenter,
    useSetDateZero,
    useSetInitialized,
    useSetSize,
    useSetStartDate,
    useSetTimePerPixel,
    zoom,
} from './store/actions'
import {DragOffset, SvgFilters} from './timeline'
import {useInitialized} from './store/hooks'


export type EventState<T extends StateKey> = Omit<FullGestureState<StateKey<T>>, 'event'> & { event: EventTypes[T] }

export const onCanvasDrag = (dispatch: ReduxDispatch, _: RefObject<SVGSVGElement> | undefined, eventState: EventState<'drag'>) => {
    let {pinching} = eventState
    if (!pinching) {
        dispatch(dragCanvas(eventState.delta[0]))
    }
}

export const onCanvasWheel = (dispatch: ReduxDispatch, svgRef: RefObject<SVGSVGElement> | undefined, eventState: EventState<'wheel'>) => {
    let svg = svgRef?.current
    if (svg !== undefined && svg !== null) {
        let point = svg.createSVGPoint()
        point.x = eventState.event.clientX
        point.y = eventState.event.clientY
        let x = point.matrixTransform(svg.getScreenCTM()?.inverse()).x

        let {delta} = eventState
        let factor = 1 + Math.sign(delta[1]) * 0.003 * Math.min(Math.abs(delta[1]), 100)

        if (eventState.first) {
            dispatch(lockZoomCenter(x))
        }
        if (eventState.last) {
            dispatch(unlockZoomCenter())
        } else {
            dispatch(zoom(factor))
        }
    }
}

export const onCanvasPinch = (dispatch: ReduxDispatch, svgRef: RefObject<SVGSVGElement> | undefined, eventState: EventState<'pinch'>) => {
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
            dispatch(lockZoomCenter(x))
        }
        if (eventState.last) {
            dispatch(unlockZoomCenter())
        } else {
            dispatch(zoom(factor))
        }
    }
}

const TimelineCanvas_: React.FC<Pick<TimelineProps, 'initialParameters' | 'style'>> = (props) => {
    let {
        children,
        style,
        initialParameters,
    } = props

    let dispatch = useDispatch()
    let initialized = useInitialized()

    let setDateZero = useSetDateZero()
    let setInitialized = useSetInitialized()
    let setStartDate = useSetStartDate()
    let setTimePerPixel = useSetTimePerPixel()
    let setSize = useSetSize()

    const {ref, width, height} = useResizeObserver<HTMLDivElement>()
    let svgRef = useRef<SVGSVGElement>(null)
    let initialStartDate = initialParameters?.startDate
    let initialEndDate = initialParameters?.endDate


    useEffect(() => {
        width && height && setSize({width, height})
    }, [width, height])


    // Initialize
    useEffect(() => {
        if ((!initialized) && width && (initialStartDate !== undefined) && (initialEndDate !== undefined)) {
            let timePerPixel = (initialEndDate!.valueOf() - initialStartDate!.valueOf()) / width

            setStartDate(initialStartDate!)
            setDateZero(initialStartDate)
            setTimePerPixel(timePerPixel)
            setTimeout(() => {
                setInitialized(true)
            }, 10)
        }
    }, [initialStartDate, initialEndDate, initialized, width])


    useGesture({
        onDrag: eventState => onCanvasDrag(dispatch, svgRef, eventState),
        onWheel: eventState => onCanvasWheel(dispatch, svgRef, eventState),
        onPinch: eventState => onCanvasPinch(dispatch, svgRef, eventState),
    }, {domTarget: svgRef, eventOptions: {passive: false}})

    return <>
        <div className={'react-timeline'} style={{touchAction: 'pan-y', ...style}} ref={ref}>
            <animated.svg
                viewBox={`0 0 ${width} ${height}`}
                className={'react-timeline-svg'}
                ref={svgRef}>

                <SvgFilters/>
                <DragOffset>
                    {initialized && <>
                        {children}
                    </>
                    }
                </DragOffset>
            </animated.svg>
        </div>
    </>
}

export const TimelineCanvas = React.memo(TimelineCanvas_, (oldProps, newProps) => {
    let result = Object.keys(newProps).map(key => [key, shallowEqual((oldProps as any)?.[key], (newProps as any)?.[key])])
    return result.every(x => x)
})