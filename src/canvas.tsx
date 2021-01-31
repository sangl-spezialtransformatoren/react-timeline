import React, {RefObject, useEffect, useRef, useState} from 'react'
import {useDrag, usePinch, useWheel} from 'react-use-gesture'
import {animated, to, useSpring} from 'react-spring'
import {Dispatch as ReduxDispatch} from 'redux'
import {useDispatch} from 'react-redux'
import {EventTypes, FullGestureState, Omit, StateKey} from 'react-use-gesture/dist/types'

import {TimelineProps} from './definitions'
import {SvgFilters} from './timeline'
import {
    useAnimate,
    useDrawerOpening,
    useDrawerWidth,
    useInitialized,
    useScrollOffset,
    useSpringConfig,
} from './store/hooks'
import {useResizeObserver} from './hooks'
import isEqual from 'react-fast-compare'
import {CanvasContext} from './canvasContext'
import {
    closeDrawer,
    deselectAllEvents,
    dragCanvas,
    lockZoomCenter,
    openDrawer,
    unlockZoomCenter,
    useSetContentHeight,
    useSetDateZero,
    useSetHeaderHeight,
    useSetInitialized,
    useSetSize,
    useSetStartDate,
    useSetTimePerPixel,
    zoom,
} from './store/actions'


export type EventState<T extends StateKey> = Omit<FullGestureState<StateKey<T>>, 'event'> & {event: EventTypes[T]}

export const onCanvasDrag = (dispatch: ReduxDispatch, _: RefObject<SVGSVGElement> | undefined, eventState: EventState<'drag'>) => {
    let {axis, distance, pinching, tap, delta, velocity, movement, elapsedTime} = eventState

    if (axis === 'x' || velocity < 3) {
        document.ontouchmove = function(e) {
            e.preventDefault()
        }
    } else {
        document.ontouchmove = function() {
            return true
        }
    }

    if (pinching) {
        return
    }
    if (tap) {
        dispatch(deselectAllEvents())
    }
    if (distance > 0) {
        let [x, y] = delta
        if (movement[0] > 80 && movement[0] / elapsedTime > 1.3 && elapsedTime > 50 && elapsedTime < 250 && !pinching) {
            dispatch(openDrawer())
        }
        if (movement[0] < -80 && movement[0] / elapsedTime < -0.9 && elapsedTime > 50 && elapsedTime < 250 && !pinching) {
            dispatch(closeDrawer())
        }
        dispatch(dragCanvas({x, y}))
    }
}

export const onCanvasWheel = (dispatch: ReduxDispatch, svgRef: RefObject<SVGSVGElement> | undefined, eventState: EventState<'wheel'>) => {
    let {distance, delta} = eventState
    eventState.event.preventDefault()

    document.ontouchmove = function(e) {
        e.preventDefault()
    }

    if (eventState.altKey) {
        let svg = svgRef?.current
        if (svg !== undefined && svg !== null) {
            let point = svg.createSVGPoint()
            point.x = eventState.event.clientX
            point.y = eventState.event.clientY
            let x = point.matrixTransform(svg.getScreenCTM()?.inverse()).x

            let {delta} = eventState
            let factor = 1 + Math.sign(delta[1]) * 0.002 * Math.min(Math.abs(delta[1]), 100)

            if (eventState.first) {
                dispatch(lockZoomCenter(x))
            }
            if (eventState.last) {
                dispatch(unlockZoomCenter())
            } else {
                dispatch(zoom(factor))
            }
        }
    } else {
        if (distance > 0) {
            let [_, y] = delta
            console.log(_)
            dispatch(dragCanvas({x: 0, y: -y, applyBounds: true}))
        }
    }
}

export const onCanvasPinch = (dispatch: ReduxDispatch, svgRef: RefObject<SVGSVGElement> | undefined, eventState: EventState<'pinch'>) => {
    eventState.event.preventDefault()
    document.ontouchmove = function() {
        return true
    }

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


export const TimelineCanvas: React.FC<Pick<TimelineProps, 'initialParameters' | 'style'>> = React.memo((props) => {
    let {
        children,
        style,
        initialParameters,
    } = props

    let initialStartDate = initialParameters?.startDate
    let initialEndDate = initialParameters?.endDate

    // Component state
    let [previousScrollOffset, setPreviousScrollOffset] = useState(0)
    let [showScrollbar, setShowScrollbar] = useState(false)
    let [timeoutVar, setTimeoutVar] = useState<NodeJS.Timeout | null>(null)

    // Redux state
    let dispatch = useDispatch()
    let initialized = useInitialized()
    let scrollOffset = useScrollOffset()
    let springConfig = useSpringConfig()
    let drawerOpening = useDrawerOpening()
    let drawerWidth = useDrawerWidth()
    let animate = useAnimate()

    // Redux actions
    let setDateZero = useSetDateZero()
    let setInitialized = useSetInitialized()
    let setStartDate = useSetStartDate()
    let setTimePerPixel = useSetTimePerPixel()
    let setSize = useSetSize()
    let setHeaderHeight = useSetHeaderHeight()
    let setContentHeight = useSetContentHeight()

    // Refs
    let divRef = useRef<HTMLDivElement>(null)
    let svgRef = useRef<SVGSVGElement>(null)
    let gridRef = useRef<SVGGElement>(null)
    let groupBackgroundsRef = useRef<SVGGElement>(null)
    let groupLabelsRef = useRef<SVGGElement>(null)
    let scrollRef = useRef<SVGRectElement>(null)
    let headerRef = useRef<SVGGElement>(null)
    let eventsRef = useRef<SVGGElement>(null)
    let groupLabelBackgroundRef = useRef<SVGGElement>(null)


    // Resize Observers
    let {width: divWidth, height: divHeight} = useResizeObserver<HTMLDivElement>(divRef)
    let {height: headerHeight} = useResizeObserver<SVGGElement>(headerRef)
    let {height: contentHeight, width: contentWidth} = useResizeObserver<SVGGElement>(groupBackgroundsRef)

    // Keep track of canvas size
    useEffect(() => {
        divWidth && divHeight && setSize({width: divWidth, height: divHeight})
    }, [divWidth, divHeight])

    useEffect(() => {
        setContentHeight(contentHeight)
    }, [contentHeight])

    // Initialize
    useEffect(() => {
        if ((!initialized) && divWidth && (initialStartDate !== undefined) && (initialEndDate !== undefined)) {
            let timePerPixel = (initialEndDate!.valueOf() - initialStartDate!.valueOf()) / divWidth

            setStartDate(initialStartDate!)
            setDateZero(initialStartDate)
            setTimePerPixel(timePerPixel)
            setTimeout(() => {
                setInitialized(true)
            }, 100)
        }
    }, [initialStartDate, initialEndDate, initialized, divWidth])

    // Keep track of header height in Redux
    useEffect(() => {
        setHeaderHeight(headerHeight)
    }, [headerHeight])

    useEffect(() => {
        if (Math.abs(scrollOffset - previousScrollOffset) > 15) {
            if (timeoutVar) {
                clearTimeout(timeoutVar)
                setTimeoutVar(null)
            }
            setShowScrollbar(true)
            let to = setTimeout(() => {
                setShowScrollbar(() => false)
            }, 2000)
            setTimeoutVar(to)
            setPreviousScrollOffset(scrollOffset)
        }
    }, [divHeight, scrollOffset, previousScrollOffset, setPreviousScrollOffset, setShowScrollbar])

    // Attach canvas gestures
    useDrag(eventState => onCanvasDrag(dispatch, svgRef, eventState), {
        domTarget: scrollRef,
        bounds: {
            top: -Math.max(headerHeight + contentHeight - divHeight, 0) - scrollOffset,
            bottom: -scrollOffset,
            left: -Infinity,
            right: Infinity,
        },
        rubberband: true,
    })
    useWheel(eventState => onCanvasWheel(dispatch, svgRef, eventState), {
        domTarget: svgRef,
        eventOptions: {passive: false},
    })
    usePinch(eventState => onCanvasPinch(dispatch, svgRef, eventState), {
        domTarget: scrollRef,
        eventOptions: {passive: false},
    })

    let [{scrollPosition: scrollOffsetSpring}] = useSpring({
        scrollPosition: scrollOffset,
        config: springConfig,
        immediate: !animate || !initialized,
    }, [springConfig, animate, initialized, scrollOffset])

    let [{drawerOpeningSpring}] = useSpring({
        drawerOpeningSpring: drawerOpening,
        config: springConfig,
        immediate: !animate || !initialized,
    }, [springConfig, animate, initialized, drawerOpening])

    let [{scrollbarX, scrollbarHeight, scrollbarColor}] = useSpring({
        scrollbarX: contentHeight > divHeight - headerHeight && showScrollbar ? contentWidth - 6 : contentWidth,
        scrollbarColor: contentHeight > divHeight - headerHeight && showScrollbar ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
        scrollbarHeight: (divHeight - headerHeight) ** 2 / contentHeight - 8,
        config: springConfig,
        immediate: !animate || !initialized,
    }, [springConfig, animate, initialized, contentWidth, showScrollbar, divHeight])


    let transform = to([scrollOffsetSpring], scrollPosition => `translate(0 ${headerHeight + scrollPosition})`)
    let transformDrawer = to([scrollOffsetSpring, drawerOpeningSpring], (scrollPosition, drawerOpening) => `translate(${-drawerWidth + drawerOpening} ${headerHeight + scrollPosition})`)
    let scrollY = to([scrollOffsetSpring], scrollOffset => headerHeight + (-scrollOffset * (divHeight - headerHeight) / contentHeight) + 3)

    return <>
        <div className={'react-timeline'} style={{...style}} ref={divRef}>
            <animated.svg
                viewBox={`0 0 ${divWidth} ${divHeight}`}
                className={'react-timeline-svg'}
                ref={svgRef}>
                <SvgFilters />
                <CanvasContext.Provider value={{
                    svg: svgRef,
                    grid: gridRef,
                    header: headerRef,
                    groupBackgrounds: groupBackgroundsRef,
                    groupLabels: groupLabelsRef,
                    events: eventsRef,
                    groupLabelBackground: groupLabelBackgroundRef,
                }}>
                    <g id={'grid'} ref={gridRef} />
                    {
                        //Mask background so that the pinch event is handled correctly
                    }
                    <g id={'group-label-background'} ref={groupLabelBackgroundRef} />
                    <animated.g id={'group-backgrounds'} ref={groupBackgroundsRef} transform={transform} />
                    <rect width={divWidth} y={headerHeight} height={divHeight - headerHeight} fill={'transparent'}
                          ref={scrollRef} />
                    <animated.g id={'events'} ref={eventsRef} transform={transform} />
                    <animated.g id={'group-labels'} ref={groupLabelsRef} transform={transformDrawer} />
                    {initialized && children}
                    <g>
                        <animated.rect width={3}
                                       height={scrollbarHeight}
                                       x={scrollbarX}
                                       y={scrollY}
                                       rx={1.5}
                                       ry={1.5}
                                       fill={scrollbarColor}
                        />
                    </g>
                    <g id={'header'} ref={headerRef} />
                </CanvasContext.Provider>
            </animated.svg>
        </div>
    </>
}, isEqual)
