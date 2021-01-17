import React, {useEffect, useRef, useState} from 'react'
import {animated, to} from 'react-spring'
import useResizeObserver from 'use-resize-observer'
import {useGesture} from 'react-use-gesture'
import {DefaultTimelineProps} from './defaults'
import {DeprecatedTimelineContext, TimelineContextShape, TimelineProps} from './definitions'
import {Provider, useDispatch} from 'react-redux'
import {TimelineStore} from './store'
import {TimelineContext, useStartDateSpring, useTimePerPixelSpring} from './context'
import {DefaultConfig} from './store/businessLogic'
import {useDateZero, useInitialized} from './store/selectors'
import {createTimelineStore} from './store/reducers/root'
import {
    useSetAnimate,
    useSetDateZero,
    useSetEvents,
    useSetInitialized,
    useSetSize,
    useSetSpringConfig,
    useSetStartDate,
    useSetTimePerPixel,
    useSetTimeZone,
    useSetWeekStartsOn,
} from './store/actions'
import './style.css'
import {EventGroups} from './group'


export const Timeline: React.FC<TimelineProps> = (props) => {
    let {config} = props
    let [store, setStore] = useState<TimelineStore<any>>()

    useEffect(() => {
        if (store) {
            let state = store.getState()
            setStore(createTimelineStore(config || DefaultConfig, state))
        } else {
            setStore(createTimelineStore(config || DefaultConfig))
        }
    }, [config])

    if (store) {
        return <Provider store={store}>
            <TimelineContext businessLogic={config || DefaultConfig}>
                <InnerTimeline {...props} />
            </TimelineContext>
        </Provider>
    }
    return <></>
}

export const DragOffset: React.FC = ({children}) => {
    let startDateSpring = useStartDateSpring()
    let timePerPixelSpring = useTimePerPixelSpring()
    let dateZero = useDateZero()
    let offset = to([startDateSpring, timePerPixelSpring], (startDate, timePerPixel) => `translate(${(dateZero.valueOf() - startDate.valueOf()) / timePerPixel.valueOf()} 0)`)

    return <animated.g transform={offset}>
        {children}
    </animated.g>
}

export const SvgFilters: React.FC = () => {
    return <defs>
        <filter id="dropshadow" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="0" result="offsetblur" />
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>
}


export const InnerTimeline: React.FC<TimelineProps> = (givenProps) => {
    let props = {...DefaultTimelineProps, ...givenProps}
    let {
        animate,
        children,
        timeZone,
        weekStartsOn,
        style,
        initialParameters,
        onCanvasDrag,
        onCanvasWheel,
        onCanvasPinch,
        onEventDrag,
        onEventDragStart,
        onEventDragEnd,
        springConfig,
        initialData,
    } = props

    let dispatch = useDispatch()
    let initialized = useInitialized()

    let setAnimate = useSetAnimate()
    let setDateZero = useSetDateZero()
    let setInitialized = useSetInitialized()
    let setSpringConfig = useSetSpringConfig()
    let setStartDate = useSetStartDate()
    let setTimePerPixel = useSetTimePerPixel()
    let setSize = useSetSize()
    let setTimeZone = useSetTimeZone()
    let setWeekStartsOn = useSetWeekStartsOn()
    let setEvents = useSetEvents()

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
        width && height && setSize({width, height})
    }, [width, height])

    useEffect(() => {
        setSpringConfig(springConfig)
    }, [springConfig])

    useEffect(() => {
        initialData && setEvents(initialData.events)
    }, [initialData?.events])

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
        onDrag: eventState => onCanvasDrag?.({dispatch, eventState}),
        onWheel: eventState => onCanvasWheel?.({dispatch, svgRef, eventState}),
        onPinch: eventState => onCanvasPinch?.({dispatch, svgRef, eventState}),
    }, {domTarget: svgRef, eventOptions: {passive: false}})

    let context: TimelineContextShape = {
        onEventDrag,
        onEventDragStart,
        onEventDragEnd,
    }

    return <>
        <DeprecatedTimelineContext.Provider value={context}>
            <div className={'react-timeline'} style={style} ref={ref}>
                <animated.svg
                    viewBox={`0 0 ${width} ${height}`}
                    className={'react-timeline-svg'}
                    ref={svgRef}>

                    <SvgFilters />
                    <DragOffset>
                        {initialized && <>
                            {children}
                          <g transform={'translate(0, 64)'}>
                            <EventGroups />
                          </g>
                        </>
                        }
                    </DragOffset>
                </animated.svg>
            </div>
        </DeprecatedTimelineContext.Provider>
    </>
}