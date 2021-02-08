import React, {RefObject, useEffect, useMemo, useRef, useState} from 'react'
import {useDrag, usePinch, useWheel} from 'react-use-gesture'
import {animated, to, useSpring} from 'react-spring'
import {Dispatch as ReduxDispatch} from 'redux'
import {EventTypes, FullGestureState, Omit, StateKey} from 'react-use-gesture/dist/types'

import {TimelineProps} from '../definitions'
import {
    useAnimate,
    useDateZero,
    useDrawerOpened,
    useDrawerWidth,
    useInitialized,
    useScrollOffset,
    useSpringConfig,
} from '../store/hooks'
import {useResizeObserver} from '../functions/hooks'
import isEqual from 'react-fast-compare'
import {CanvasContext} from '../context/canvasContext'
import {
    closeDrawer,
    deselectAllEvents,
    dragCanvas,
    lockZoomCenter,
    openDrawer,
    unlockZoomCenter,
    useSetContentHeight,
    useSetDateZero,
    useSetDrawerWidth,
    useSetHeaderHeight,
    useSetInitialized,
    useSetSize,
    useSetStartDate,
    useSetTimePerPixel,
    zoom,
} from '../store/actions'
import {activateBodyScroll, deactivateBodyScroll} from '../functions/misc'
import {useStartDateSpring, useTimePerPixelSpring} from '../context'
import {useDispatch} from '../store'

export const DragOffset: React.FC = React.memo(
    function DragOffset({children}) {
        let startDateSpring = useStartDateSpring()
        let timePerPixelSpring = useTimePerPixelSpring()
        let dateZero = useDateZero()
        let offset = to([startDateSpring, timePerPixelSpring], (startDate, timePerPixel) => `translate(${(dateZero.valueOf() - startDate.valueOf()) / timePerPixel.valueOf()} 0)`)

        return <animated.g transform={offset}>
            {children}
        </animated.g>
    }
)

export const TimelineCanvas: React.FC<Pick<TimelineProps, 'initialStartDate' | 'initialEndDate' | 'style'>> = React.memo(function TimelineCanvas(props) {
    let {
        children,
        style,
        initialStartDate,
        initialEndDate,
    } = props


    // Component state
    let [previousScrollOffset, setPreviousScrollOffset] = useState(0)
    let [showScrollbar, setShowScrollbar] = useState(false)
    let [timeoutVar, setTimeoutVar] = useState<NodeJS.Timeout | null>(null)

    // Redux state
    let dispatch = useDispatch()
    let initialized = useInitialized()
    let scrollOffset = useScrollOffset()
    let springConfig = useSpringConfig()
    let drawerOpened = useDrawerOpened()
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
    let setDrawerWidth = useSetDrawerWidth()

    // Refs
    let divRef = useRef<HTMLDivElement>(null)
    let svgRef = useRef<SVGSVGElement>(null)
    let gridRef = useRef<SVGGElement>(null)
    let groupBackgroundsRef = useRef<SVGGElement>(null)
    let groupLabelsRef = useRef<SVGGElement>(null)
    let scrollRef = useRef<SVGRectElement>(null)
    let headerRef = useRef<SVGGElement>(null)
    let eventsRef = useRef<SVGGElement>(null)
    let foregroundRef = useRef<SVGGElement>(null)

    // Resize Observers
    let {width: divWidth, height: divHeight} = useResizeObserver<HTMLDivElement>(divRef)
    let {height: headerHeight} = useResizeObserver<SVGGElement>(headerRef)
    let {height: contentHeight, width: contentWidth} = useResizeObserver<SVGGElement>(groupBackgroundsRef)
    let {width: groupLabelsWidth} = useResizeObserver<SVGGElement>(groupLabelsRef)

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
            let timePerPixel = (initialEndDate!.valueOf() - initialStartDate!.valueOf()) / (divWidth)

            setStartDate(initialStartDate!.valueOf())
            setDateZero(initialStartDate)
            setTimePerPixel(timePerPixel)
            setTimeout(() => {
                setInitialized(true)
            }, 50)
        }
    }, [initialStartDate, initialEndDate, initialized, divWidth])

    // Keep track of header height in Redux
    useEffect(() => {
        setHeaderHeight(headerHeight)
    }, [headerHeight])

    // Keep rack of the drawer width in Redux
    useEffect(() => {
        setDrawerWidth(groupLabelsWidth)
    }, [groupLabelsWidth])


    // Hide Scrollbar after 2s
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

    // Callbacks
    let onDrag = useMemo(() => {
        return (eventState: EventState<'drag'>) => onCanvasDrag(dispatch, svgRef, eventState)
    }, [dispatch, svgRef])
    let onWheel = useMemo(() => {
        return (eventState: EventState<'wheel'>) => onCanvasWheel(dispatch, svgRef, eventState)
    }, [dispatch, svgRef])
    let onPinch = useMemo(() => {
        return (eventState: EventState<'pinch'>) => onCanvasPinch(dispatch, svgRef, eventState)
    }, [dispatch, svgRef])


    // Attach canvas gestures
    useDrag(onDrag, {
        domTarget: scrollRef,
        bounds: {
            top: -Math.max(headerHeight + contentHeight - divHeight, 0) - scrollOffset,
            bottom: -scrollOffset,
            left: -Infinity,
            right: Infinity,
        },
        rubberband: animate,
    })

    useWheel(onWheel, {
        domTarget: svgRef,
        eventOptions: {passive: false},
    })

    usePinch(onPinch, {
        domTarget: scrollRef,
        eventOptions: {passive: false},
    })

    // Springs
    let [{scrollPosition: scrollOffsetSpring}] = useSpring({
        scrollPosition: scrollOffset || 0,
        config: springConfig,
        immediate: !animate || !initialized,
    }, [springConfig, animate, initialized, scrollOffset])

    let [{drawerOpeningSpring}] = useSpring({
        drawerOpeningSpring: drawerOpened ? 0 : -1 * drawerWidth,
        config: springConfig,
        immediate: !animate || !initialized,
    }, [springConfig, animate, initialized, drawerOpened, drawerWidth])

    let [{
        scrollbarX: scrollbarXSpring,
        scrollbarHeight: scrollbarHeightSpring,
        scrollbarColor: scrollbarColorSpring,
    }] = useSpring({
        scrollbarX: contentHeight > divHeight - headerHeight && showScrollbar ? contentWidth - 6 : contentWidth,
        scrollbarColor: contentHeight > divHeight - headerHeight && showScrollbar ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
        scrollbarHeight: contentHeight !== 0 ? (divHeight - headerHeight) ** 2 / contentHeight - 8 : 0,
        config: springConfig,
        immediate: !animate || !initialized,
    }, [springConfig, animate, initialized, contentWidth, showScrollbar, divHeight])


    // Interpolations
    let scrollTransform = to([scrollOffsetSpring], scrollPosition => `translate(0 ${headerHeight + scrollPosition})`)
    let drawerTransform = to([scrollOffsetSpring, drawerOpeningSpring], (scrollPosition, drawerOpening) => `translate(${drawerOpening} ${headerHeight + scrollPosition})`)
    let scrollbarY = to([scrollOffsetSpring], scrollOffset => contentHeight !== 0 ? headerHeight + (-scrollOffset * (divHeight - headerHeight) / contentHeight) + 3 : 0)

    let canvasContextValue = useMemo(() => {
        return {
            svg: svgRef,
            grid: gridRef,
            header: headerRef,
            groupBackgrounds: groupBackgroundsRef,
            groupLabels: groupLabelsRef,
            events: eventsRef,
            foreground: foregroundRef,
        }
    }, [svgRef, gridRef, headerRef, groupBackgroundsRef, groupLabelsRef, eventsRef, foregroundRef])

    return <>
        <div className={'react-timeline'} style={{...style}} ref={divRef}>
            <animated.svg
                viewBox={`0 0 ${divWidth} ${divHeight}`}
                className={'react-timeline-svg'}
                ref={svgRef}>
                <CanvasContext.Provider value={canvasContextValue}>
                    <g id={'grid'} ref={gridRef}/>
                    <animated.g id={'group-backgrounds'} ref={groupBackgroundsRef} transform={scrollTransform}/>

                    {
                        //Mask background so that the pinch event is handled correctly
                    }
                    <g id={'drag-surface'}>
                        <rect width={divWidth} y={headerHeight} height={divHeight - headerHeight}
                              fill={'transparent'}
                              ref={scrollRef}/>
                    </g>
                    <animated.g id={'events'} ref={eventsRef} transform={scrollTransform}/>
                    <animated.g id={'group-labels'} ref={groupLabelsRef} transform={drawerTransform}/>
                    {initialized && children}
                    <g id={'scrollbar'}>
                        <animated.rect width={3}
                                       height={scrollbarHeightSpring}
                                       x={scrollbarXSpring}
                                       y={scrollbarY}
                                       rx={1.5}
                                       ry={1.5}
                                       fill={scrollbarColorSpring}
                        />
                    </g>
                    <g id={'header'} ref={headerRef}/>
                    <g id={'foreground'} ref={foregroundRef}/>
                </CanvasContext.Provider>
            </animated.svg>
        </div>
    </>
}, isEqual)

// Event handlers
export type EventState<T extends StateKey> = Omit<FullGestureState<StateKey<T>>, 'event'> & {event: EventTypes[T]}

export const onCanvasDrag = (dispatch: ReduxDispatch, _: RefObject<SVGSVGElement> | undefined, eventState: EventState<'drag'>) => {
    let {last, distance, pinching, tap, delta, movement, elapsedTime} = eventState

    deactivateBodyScroll(document)
    if (last) {
        activateBodyScroll(document)
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
    let {distance, delta, last, memo, velocity} = eventState
    let zooming: boolean = memo || false

    deactivateBodyScroll(document)
    if (last) {
        activateBodyScroll(document)
    }

    if (velocity < 0.1 && eventState.altKey) {
        zooming = true
    } else if (velocity < 0.1 && !eventState.altKey) {
        zooming = false
    }

    if (zooming) {
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
            let y = delta[1]
            dispatch(dragCanvas({x: 0, y: -y, applyBounds: true}))
        }
    }
    return zooming
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
