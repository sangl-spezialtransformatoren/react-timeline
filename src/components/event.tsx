import React, {MutableRefObject, RefObject, useMemo, useRef} from 'react'
import {animated, to, useSpring} from 'react-spring'
import {useDrag} from 'react-use-gesture'
import {useBusinessLogic, useTimePerPixelSpring} from '../context'
import {resetDragOrResize, Thunk, toggleEventSelection, updateEvents, updateEventsIntermediary} from '../store/actions'
import {DragOffset, EventState} from './canvas'
import {
    useAnimate,
    useDateZero,
    useEventAndGroupIds,
    useEventHeight,
    useEventIdsOrderedForPainting,
    useEventIntervals,
    useEventYs,
    useGroupHeights,
    useInitialized,
    useMapEventIdToSelected,
    useSpringConfig,
} from '../store/hooks'
import {Dispatch, useDispatch} from '../store'
import {BusinessLogic} from '../store/businessLogic'
import {
    selectEvents,
    selectInternalEventData,
    selectNumberOfSelectedEvents,
    selectSelectedEvents,
    selectTimePerPixel,
} from '../store/selectors'
import {OnEventSpace, useCanvasContext} from '../context/canvasContext'
import {DefaultEventComponent} from '../presentational/event'
import {activateBodyScroll, boundingBoxRelativeToSVGRoot, deactivateBodyScroll} from '../functions/misc'
import {PureInterval} from '../store/reducers/events'

export type PresentationalEventComponentProps = {
    x: number,
    y: number,
    width: number,
    height: number,
    selected: boolean,
    groupId: string,
    eventId: string,
    groupHeight?: number,
    dragHandle: MutableRefObject<any>,
    dragStartHandle: MutableRefObject<any>,
    dragEndHandle: MutableRefObject<any>
}
export type PresentationalEventComponent<T = {}> = React.FC<PresentationalEventComponentProps & T>

export type EventComponentProps<T = {}> = {
    id: string
    eventHeight?: number
    groupHeight?: number
    interval: PureInterval
    eventProps: any
    selected: boolean
} & T

export type EventComponentType<T = {}> = React.FC<Omit<EventComponentProps<T>, keyof PresentationalEventComponentProps> & {y: number, groupHeight?: number, selected: boolean}>


export function createEventComponent<T>(component: React.FC<T>) {
    let PresentationalComponent = animated(component)

    let EventComponent: EventComponentType<T> = (
        {
            id,
            y,
            eventHeight = 20,
            groupHeight,
            interval,
            eventProps,
            selected,
            children,
            ...otherProps
        }) => {

        // Redux
        let dispatch = useDispatch()

        // Redux state
        let dateZero = useDateZero()
        let animate = useAnimate()
        let initialized = useInitialized()
        let springConfig = useSpringConfig()

        // Other State
        let timePerPixelSpring = useTimePerPixelSpring()
        let businessLogic = useBusinessLogic()
        let {svg: svgRef} = useCanvasContext()

        // Refs
        let ref = useRef<SVGGeometryElement>(null)
        let startRef = useRef<SVGGeometryElement>(null)
        let endRef = useRef<SVGGeometryElement>(null)

        // Callbacks
        let onDrag = useMemo(() => {
            return (eventState: EventState<'drag'>) => onEventDrag(dispatch, businessLogic, eventState, svgRef, id)
        }, [dispatch, businessLogic, svgRef, id])

        let onDragStart = useMemo(() => {
            return (eventState: EventState<'drag'>) => onEventStartDrag(dispatch, businessLogic, eventState, svgRef, id)
        }, [dispatch, businessLogic, svgRef, id])

        let onDragEnd = useMemo(() => {
            return (eventState: EventState<'drag'>) => onEventEndDrag(dispatch, businessLogic, eventState, svgRef, id)
        }, [dispatch, businessLogic, svgRef, id])

        // Springs
        let [{ySpring, intervalStartSpring, intervalEndSpring, groupHeightSpring}] = useSpring({
            intervalStartSpring: interval.start,
            intervalEndSpring: interval.end,
            ySpring: y,
            groupHeightSpring: groupHeight,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, interval.start, interval.end, animate, initialized, y, groupHeight])

        // Interpolations
        let xSpring = to([timePerPixelSpring, intervalStartSpring], (timePerPixel, intervalStart) => (intervalStart.valueOf() - dateZero.valueOf()) / timePerPixel.valueOf())
        let widthSpring = to([timePerPixelSpring, intervalStartSpring, intervalEndSpring], (timePerPixel, intervalStart, intervalEnd) => (intervalEnd.valueOf() - intervalStart.valueOf()) / timePerPixel.valueOf())

        // Attach gestures
        useDrag(onDrag, {domTarget: ref})
        useDrag(onDragStart, {domTarget: startRef})
        useDrag(onDragEnd, {domTarget: endRef})

        // Define props
        let props = useMemo(() => ({
            x: xSpring,
            y: ySpring,
            width: widthSpring,
            height: eventHeight,
            groupHeight: groupHeightSpring,
            dragHandle: ref,
            dragStartHandle: startRef,
            dragEndHandle: endRef,
            eventId: id,
            selected,
            ...eventProps,
            ...otherProps,
        }), [xSpring, ySpring, widthSpring, eventHeight, groupHeightSpring, ref, startRef, endRef, id, selected, eventProps, otherProps])

        // @ts-ignore
        return <PresentationalComponent {...props} />
    }
    return React.memo(EventComponent)
}


export type TimelineGroupProps = {
    component?: React.FC<PresentationalEventComponentProps>
}

export const Events_: React.FC<TimelineGroupProps> = React.memo(function Events({component = DefaultEventComponent}) {
    // Create event component
    let Component = useMemo(() => {
        return createEventComponent(component)
    }, [component])

    // Redux state
    let events = useEventIdsOrderedForPainting()
    let eventToGroup = useEventAndGroupIds()
    let eventHeight = useEventHeight()
    let mapEventToInterval = useEventIntervals()
    let mapEventToSelected = useMapEventIdToSelected()

    // Calculated state
    let groupHeightsPixel = useGroupHeights()
    let eventYs = useEventYs()

    let otherProps = useMemo(() => ({}), [])

    return <>
        {events.map((eventId) => <Component
                key={eventId}
                id={eventId}
                eventHeight={eventHeight}
                y={eventYs[eventId]}
                groupHeight={groupHeightsPixel[eventToGroup[eventId]]}
                interval={mapEventToInterval[eventId]}
                selected={mapEventToSelected[eventId]}
                eventProps={otherProps}
            />,
        )}
    </>
})

export const Events: React.FC<TimelineGroupProps> = ({component = DefaultEventComponent}) => {
    return <OnEventSpace>
        <DragOffset>
            <Events_ component={component} />
        </DragOffset>
    </OnEventSpace>
}


const onEventDrag = (dispatch: Dispatch, config: BusinessLogic, eventState: EventState<'drag'>, svgRef: RefObject<SVGSVGElement>, id: string) => {
    let {movement: [dx], last, tap, distance, xy, pinching} = eventState

    if (tap) {
        let action: Thunk = async (dispatch) => {
            dispatch(toggleEventSelection({id}))
        }
        dispatch(action)
        return
    }
    if (distance === 0) {
        return
    }
    if (pinching) {
        return
    }

    deactivateBodyScroll(document)
    if (last) {
        activateBodyScroll(document)
    }

    let action: Thunk = async (dispatch, getState) => {
        let state = getState()
        let numberOfSelectedEvents = selectNumberOfSelectedEvents(config)(state)
        let allEvents = selectEvents(config)(state)
        let internalEventData = selectInternalEventData(config)(state)

        let selectedEvents
        if (numberOfSelectedEvents === 0) {
            selectedEvents = {[id]: allEvents[id]}
        } else {
            selectedEvents = selectSelectedEvents(config)(state)
            if (!Object.keys(selectedEvents).includes(id)) {
                return
            }
        }

        let timePerPixel = selectTimePerPixel(config)(state)
        let dt = dx * timePerPixel
        let newIntervals = Object.fromEntries(Object.entries(selectedEvents).map(
            ([eventId, event]) => {
                let oldInterval = internalEventData?.[eventId]?.initialInterval || event.interval
                let newInterval = {
                    start: oldInterval.start + dt,
                    end: oldInterval.end + dt,
                }
                return [eventId, newInterval]
            }),
        )

        let newGroups: Record<string, string> = {}
        if (svgRef.current) {
            let point = svgRef.current.createSVGPoint()
            point.x = xy[0]
            point.y = xy[1]
            let y = point.matrixTransform(svgRef.current.getScreenCTM()?.inverse()).y
            let groupPositions = Object.fromEntries(
                Array.from(
                    document.getElementsByClassName('react-timeline-group-background')).map(
                    (element) => [element.id, boundingBoxRelativeToSVGRoot(element as SVGGeometryElement, svgRef.current!, svgRef.current!)],
                ),
            )
            let newGroupId: string = ''
            let nearestGroupId: string = ''
            let lowestGroup = ''
            let bottom: number = 0
            let buffer = 5
            for (let [groupId, position] of Object.entries(groupPositions)) {
                if ((position.y + position.height) > bottom) {
                    bottom = position.y + position.height
                    lowestGroup = groupId
                }
                if (groupId !== allEvents[id].groupId && y >= position.y && y < (position.y + position.height)) {
                    newGroupId = groupId
                    break
                }
                if (groupId !== allEvents[id].groupId && y >= position.y - buffer && y < (position.y + position.height + buffer)) {
                    nearestGroupId = groupId
                }
            }
            if (!newGroupId && lowestGroup && y > bottom) {
                newGroupId = lowestGroup
            }
            if (newGroupId !== '') {
                newGroups = Object.fromEntries(Object.keys(selectedEvents).map(eventId => [eventId, newGroupId]))
            }
            if (nearestGroupId !== '') {
                newGroups = Object.fromEntries(Object.keys(selectedEvents).map(eventId => [eventId, nearestGroupId]))
            }
        }

        if (!last) {
            let {events: newEvents} = config.validateDuringDrag({
                manipulatedEventId: id,
                newIntervals: newIntervals,
                newGroups: newGroups,
                events: allEvents,
            })
            if (newEvents) {
                dispatch(updateEventsIntermediary({events: newEvents}))
            }
        } else {
            try {
                let {events: newEvents} = await config.validateAfterDrag({
                    manipulatedEventId: id,
                    newIntervals: newIntervals,
                    newGroups: newGroups,
                    events: allEvents,
                })
                if (newEvents) {
                    dispatch(updateEvents({events: newEvents}))
                }
            } catch (e) {
                dispatch(resetDragOrResize())
            }
        }
    }
    dispatch(action)
}

const onEventStartDrag = (dispatch: Dispatch, config: BusinessLogic, eventState: EventState<'drag'>, _: RefObject<SVGSVGElement>, id: any) => {
    let {movement: [dx], last, pinching} = eventState

    if (pinching) {
        return
    }

    deactivateBodyScroll(document)
    if (last) {
        activateBodyScroll(document)
    }


    let action: Thunk = async (dispatch: Dispatch, getState) => {
        let state = getState()
        let event = selectEvents(config)(state)[id]
        let internalEventData = selectInternalEventData(config)(state)

        let selectedEvents = selectSelectedEvents(config)(state)
        if (!selectedEvents[id]) {
            return
        }

        let oldInterval = internalEventData?.[id]?.initialInterval || event.interval
        let timePerPixel = selectTimePerPixel(config)(state)
        let events = selectEvents(config)(state)

        let dt = dx * timePerPixel
        let newInterval = {
            start: oldInterval.start + dt,
            end: oldInterval.end,
        }
        if (!last) {
            let {events: newEvents} = config.validateDuringResize({
                manipulatedEventId: id,
                newIntervals: {[id]: newInterval},
                events,
            })
            if (newEvents) {
                dispatch(updateEventsIntermediary({events: newEvents}))
            }
        } else {
            try {
                let {events: newEvents} = await config.validateAfterResize({
                    manipulatedEventId: id,
                    newIntervals: {[id]: newInterval},
                    events,
                })
                if (newEvents) {
                    dispatch(updateEvents({events: newEvents}))
                }
            } catch (e) {
                dispatch(resetDragOrResize())
            }
        }
    }
    dispatch(action)

}

const onEventEndDrag = (dispatch: Dispatch, config: BusinessLogic, eventState: EventState<'drag'>, _: RefObject<SVGSVGElement>, id: any) => {
    let {movement: [dx], last, pinching} = eventState

    if (pinching) {
        return
    }

    deactivateBodyScroll(document)
    if (last) {
        activateBodyScroll(document)
    }

    let action: Thunk = async (dispatch, getState) => {
        let state = getState()
        let event = selectEvents(config)(state)[id]
        let internalEventData = selectInternalEventData(config)(state)

        let selectedEvents = selectSelectedEvents(config)(state)
        if (!selectedEvents[id]) {
            return
        }

        let oldInterval = internalEventData?.[id]?.initialInterval || event.interval
        let timePerPixel = selectTimePerPixel(config)(state)
        let events = selectEvents(config)(state)

        let dt = dx * timePerPixel
        let newInterval = {
            start: oldInterval.start,
            end: oldInterval.end + dt,
        }

        if (!last) {
            let {events: newEvents} = config.validateDuringResize({
                manipulatedEventId: id,
                newIntervals: {[id]: newInterval},
                events,
            })
            if (newEvents) {
                dispatch(updateEventsIntermediary({events: newEvents}))
            }
        } else {
            try {
                let {events: newEvents} = await config.validateAfterResize({
                    manipulatedEventId: id,
                    newIntervals: {[id]: newInterval},
                    events,
                })
                if (newEvents) {
                    dispatch(updateEvents({events: newEvents}))
                }
            } catch (e) {
                dispatch(resetDragOrResize())
            }
        }
    }
    dispatch(action)
}