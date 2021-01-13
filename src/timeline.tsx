import React, {useEffect, useRef, useState} from 'react'
import {animated, config, to, useSpring} from 'react-spring'
import useResizeObserver from 'use-resize-observer'
import './style.css'
import {useGesture} from 'react-use-gesture'
import {DefaultTimelineProps, DefaultTimelineState} from './defaults'
import {TimelineContext, TimelineContextShape, TimelineEvent, TimelineProps, TimelineState} from './definitions'
import {EventGroup} from './blocks'

export const useTimelineState = (initialState: Partial<TimelineState>) => {
    return useState<TimelineState>({...DefaultTimelineState, ...initialState})
}

export const Timeline: React.FC<TimelineProps> = (givenProps) => {
    let props = {...DefaultTimelineProps, ...givenProps}
    let {
        animate,
        children,
        style,
        state,
        setState,
        initialParameters,
        onCanvasDrag,
        onCanvasWheel,
        onCanvasPinch,
        onEventDrag,
        onEventDragStart,
        onEventDragEnd
    } = props
    let {internal: {initialized, dateZero}, data, startDate, timePerPixel} = state

    let [groupsAndEvents, setGroupsAndEvents] = useState<{ [groupsId: string]: { [eventId: string]: TimelineEvent } }>({})

    const {ref, width, height} = useResizeObserver<HTMLDivElement>()
    let svgRef = useRef<SVGSVGElement>(null)
    let initialStartDate = initialParameters?.startDate
    let initialEndDate = initialParameters?.endDate

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
        }
    }, [initialStartDate, initialEndDate, initialized, width])

    useEffect(() => {
        setState({...state, internal: {...state.internal, svg: svgRef}})
    }, [svgRef])

    useEffect(() => {
        if (width && Math.abs(startDate.valueOf() + width * timePerPixel / 2 - dateZero.valueOf()) > Math.abs(width * timePerPixel)) {
            setState({
                ...state,
                internal: {
                    ...state.internal,
                    dateZero: startDate.valueOf() + width * timePerPixel / 2
                }
            })
        }

    }, [startDate, dateZero, width, timePerPixel])

    useGesture({
        onDrag: eventState => onCanvasDrag?.({state, setState, eventState}),
        onWheel: eventState => onCanvasWheel?.({state, setState, eventState}),
        onPinch: eventState => onCanvasPinch?.({state, setState, eventState})
    }, {domTarget: svgRef, eventOptions: {passive: false}})

    let [{
        animatedStartDate,
        animatedEndDate,
        animatedTimePerPixel,
        animatedDateZero
    }] = useSpring<{ animatedStartDate: number | Date, animatedEndDate: number | Date, animatedTimePerPixel: number, animatedDateZero: Date | number }>({
        animatedStartDate: startDate,
        animatedEndDate: startDate.valueOf() + (width || 0) * state.timePerPixel,
        animatedTimePerPixel: state.timePerPixel,
        animatedDateZero: state.internal.dateZero,
        immediate: !animate || !initialized,
        config: config.stiff
    }, [startDate, width, state.timePerPixel, state.internal.dateZero])

    let context: TimelineContextShape = {
        state,
        setState,
        animate: !!animate,
        startDate: startDate,
        dateZero: state.internal.dateZero,
        endDate: startDate.valueOf() + (width || 0) * state.timePerPixel,
        startDateSpring: animatedStartDate,
        endDateSpring: animatedEndDate,
        dateZeroSpring: animatedDateZero,
        timePerPixel: state.timePerPixel || 1,
        timePerPixelSpring: animatedTimePerPixel,
        svgWidth: width || 1,
        springConfig: config.stiff,
        initialized: state.internal.initialized,
        onEventDrag,
        onEventDragStart,
        onEventDragEnd
    }

    let offset = to([animatedStartDate, animatedTimePerPixel], (startDate, timePerPixel) => `translate(${(dateZero.valueOf() - startDate.valueOf()) / timePerPixel.valueOf()} 0)`)

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
                        {state.internal.initialized && <>
                            {children}
                            {Object.entries(groupsAndEvents).map(([_, events]) => {
                                return <EventGroup events={events}/>
                            })}
                        </>
                        }
                    </animated.g>
                </animated.svg>
            </div>
        </TimelineContext.Provider>
    </>
}