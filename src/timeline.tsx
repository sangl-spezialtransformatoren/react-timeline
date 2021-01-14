import React, {useEffect, useRef, useState} from 'react'
import {animated, config, to, useSpring} from 'react-spring'
import useResizeObserver from 'use-resize-observer'
import './style.css'
import {useGesture} from 'react-use-gesture'
import {DefaultTimelineProps, DefaultTimelineState} from './defaults'
import {TimelineContext, TimelineContextShape, TimelineEvent, TimelineProps, TimelineState} from './definitions'
import {EventGroup} from './blocks'
import {Provider, useDispatch} from "react-redux"
import {timeLineStore} from "./store"
import {useInitialized, useSetInitialized} from "./store/initialized"
import {v4 as uuidv4} from 'uuid'
import {
    useDateZero,
    useSetDateZero,
    useSetStartDate,
    useSetTimePerPixel,
    useStartDate,
    useTimePerPixel,
    useZoomCenter
} from "./store/timeScale"
import {useSetAnimate} from "./store/animate"
import {useSetSpringConfig} from "./store/springConfig"
import {useSetSize} from "./store/size"
import {useSetTimeZone} from "./store/timeZone"
import {useSetWeekStartsOn} from "./store/weekStartsOn"

export const useTimelineState = (initialState: Partial<TimelineState>) => {
    return useState<TimelineState>({...DefaultTimelineState, ...initialState})
}

export const Timeline: React.FC<TimelineProps> = (props) => {
    return <Provider store={timeLineStore}>
        <InnerTimeline {...props}/>
    </Provider>
}

export const InnerTimeline: React.FC<TimelineProps> = (givenProps) => {
    let props = {...DefaultTimelineProps, ...givenProps}
    let {
        animate,
        children,
        timeZone,
        weekStartsOn,
        style,
        state,
        setState,
        initialParameters,
        onCanvasDrag,
        onCanvasWheel,
        onCanvasPinch,
        onEventDrag,
        onEventDragStart,
        onEventDragEnd,
        springConfig
    } = props

    let dispatch = useDispatch()
    let initialized = useInitialized()
    let dateZero = useDateZero()
    let startDate = useStartDate()
    let timePerPixel = useTimePerPixel()
    let zoomCenter = useZoomCenter()

    let setAnimate = useSetAnimate()
    let setDateZero = useSetDateZero()
    let setInitialized = useSetInitialized()
    let setSpringConfig = useSetSpringConfig()
    let setStartDate = useSetStartDate()
    let setTimePerPixel = useSetTimePerPixel()
    let setSize = useSetSize()
    let setTimeZone = useSetTimeZone()
    let setWeekStartsOn = useSetWeekStartsOn()

    let {data} = state

    let [groupsAndEvents, setGroupsAndEvents] = useState<{ [groupsId: string]: { [eventId: string]: TimelineEvent } }>({})
    let [svgId, setSvgId] = useState("")

    const {ref, width, height} = useResizeObserver<HTMLDivElement>()
    let svgRef = useRef<SVGSVGElement>(null)
    let initialStartDate = initialParameters?.startDate
    let initialEndDate = initialParameters?.endDate

    useEffect(() => {
        setAnimate(animate!)
    }, [animate])

    useEffect(() => {
        setTimeZone(timeZone!)
    }, [timeZone])

    useEffect(() => {
        setWeekStartsOn(weekStartsOn!)
    }, [weekStartsOn])

    useEffect(() => {
        if (width && (Math.abs(startDate.valueOf() - dateZero.valueOf()) > Math.abs(width * timePerPixel))) {
            setDateZero(startDate.valueOf() + width * timePerPixel / 2)
        }
    }, [startDate, dateZero, width, timePerPixel])

    useEffect(() => {
        setSize({width: width!, height: height!})
    }, [width, height])

    useEffect(() => {
        setSpringConfig(springConfig)
    }, [springConfig])

    // Initialize
    useEffect(() => {
        if ((!initialized) && width && (initialStartDate !== undefined) && (initialEndDate !== undefined)) {
            let timePerPixel = (initialEndDate!.valueOf() - initialStartDate!.valueOf()) / width

            setState({
                ...state,
                startDate: initialStartDate!,
                timePerPixel: timePerPixel,
                internal: {
                    ...state.internal,
                    initialized: true,
                    dateZero: initialStartDate.valueOf()
                }
            })

            setStartDate(initialStartDate!)
            setInitialized(true)
            setDateZero(initialStartDate)
            setTimePerPixel(timePerPixel)
        }
    }, [initialStartDate, initialEndDate, initialized, width])


    useGesture({
        onDrag: eventState => onCanvasDrag?.({dispatch, state, setState, eventState}),
        onWheel: eventState => onCanvasWheel?.({dispatch, svgRef, state, setState, eventState}),
        onPinch: eventState => onCanvasPinch?.({dispatch, svgRef, state, setState, eventState})
    }, {domTarget: svgRef, eventOptions: {passive: false}})

    let [{
        startDateSpring,
        endDateSpring,
        timePerPixelSpring
    }] = useSpring<{ startDateSpring: number | Date, endDateSpring: number | Date, timePerPixelSpring: number }>({
        startDateSpring: startDate,
        endDateSpring: startDate.valueOf() + (width || 0) * state.timePerPixel,
        timePerPixelSpring: state.timePerPixel,
        immediate: !animate || !initialized,
        config: config.stiff
    }, [startDate, width, timePerPixel, dateZero])


    let context: TimelineContextShape = {
        state,
        setState,
        startDateSpring: startDateSpring,
        endDateSpring: endDateSpring,
        timePerPixelSpring: timePerPixelSpring,
        svgWidth: width || 1,
        onEventDrag,
        onEventDragStart,
        onEventDragEnd
    }

    useEffect(() => {
        setSvgId(uuidv4())
    }, [])

    let offset = to([startDateSpring, timePerPixelSpring], (startDate, timePerPixel) => `translate(${(dateZero.valueOf() - startDate.valueOf()) / timePerPixel.valueOf()} 0)`)

    useEffect(() => {
        let animatedEvents = data?.events ? Object.fromEntries(Object.keys(data.events).map((id) => {
            return [id, {
                ...data?.events[id]!,
                ...state.internal?.animatedData?.events?.[id],
                manipulated: !!state.internal?.animatedData?.events?.[id]
            }]
        })) : {}
        data?.groups && setGroupsAndEvents(Object.fromEntries(data.groups.map(group => [group, Object.fromEntries(Object.entries(animatedEvents).filter(([_, event]) => event.group === group))])))
    }, [data?.groups, data?.events, state.internal.animatedData.events])

    return <>
        <TimelineContext.Provider value={context}>
            <div className={'react-timeline'} style={style} ref={ref}>
                <animated.svg
                    viewBox={`0 0 ${width} ${height}`}
                    className={'react-timeline-svg'}
                    ref={svgRef}
                    id={svgId}
                >
                    <defs>
                        <filter id="dropshadow" height="130%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                            <feOffset dx="0" dy="0" result="offsetblur"/>
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.5"/>
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <animated.g transform={offset}>
                        {zoomCenter &&
                        <rect x={(zoomCenter!.valueOf() - dateZero.valueOf()) / timePerPixel} y={0} width={3} height={500} fill={"red"}/>}
                        {initialized && <>
                            {children}
                            <g transform={"translate(0, 64)"}>
                                {Object.entries(groupsAndEvents).map(([_, events]) => {
                                    return <EventGroup events={events}/>
                                })}
                            </g>
                        </>
                        }
                    </animated.g>
                </animated.svg>
            </div>
        </TimelineContext.Provider>
    </>
}