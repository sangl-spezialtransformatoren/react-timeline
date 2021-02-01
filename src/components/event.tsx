import React, {MutableRefObject, RefObject, useMemo, useRef} from 'react'
import {animated, to, useSpring} from 'react-spring'
import {useGesture} from 'react-use-gesture'
import {useDispatch} from 'react-redux'
import {useBusinessLogic, useTimePerPixelSpring} from '../context'
import {resetDragOrResize, Thunk, toggleEventSelection, updateEvents, updateEventsIntermediary} from '../store/actions'
import {EventState} from './canvas'
import {
    useAnimate,
    useDateZero,
    useEventAndGroupIds,
    useEventHeight,
    useEventIdsOrderedForPainting,
    useEventMargin,
    useEventPositionsInGroup,
    useEventProps,
    useGetInterval,
    useGroupHeights,
    useGroupIds,
    useGroupPadding,
    useInitialized,
    useIsEventSelected,
    useMinGroupHeight,
    useSpringConfig,
} from '../store/hooks'
import {Dispatch} from '../store'
import {BusinessLogic} from '../store/businessLogic'
import {
    selectEvents,
    selectInternalEventData,
    selectNumberOfSelectedEvents,
    selectSelectedEvents,
    selectTimePerPixel,
} from '../store/selectors'
import {Foreground, useCanvasContext} from '../context/canvasContext'
import {EventComponent as DefaultEventComponent} from "../presentational/event"
import {DragOffset} from "../timeline"
import {boundingBoxRelativeToSVGRoot} from "../functions/misc"

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
} & T

export type EventComponentType<T = {}> = React.FC<Omit<EventComponentProps<T>, keyof PresentationalEventComponentProps> & { y: number, groupHeight?: number }>


export function createEventComponent<T>(component: React.FC<T>) {
    let EventComponent: EventComponentType<T> = (
        {
            id,
            y,
            eventHeight = 20,
            groupHeight,
            children,
            ...otherProps
        }) => {
        // Animate component
        let PresentationalComponent = animated(component)

        // Redux
        let dispatch = useDispatch()

        // Redux state
        let dateZero = useDateZero()
        let animate = useAnimate()
        let initialized = useInitialized()
        let springConfig = useSpringConfig()

        // TODO: Move up
        let interval = useGetInterval(id)
        let eventProps = useEventProps(id)
        let selected = useIsEventSelected(id)

        // Other State
        let timePerPixelSpring = useTimePerPixelSpring()
        let businessLogic = useBusinessLogic()
        let {svg: svgRef} = useCanvasContext()


        // Refs
        let ref = useRef<SVGGeometryElement>(null)
        let startRef = useRef<SVGGeometryElement>(null)
        let endRef = useRef<SVGGeometryElement>(null)

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
        useGesture({
            onDrag: eventState => onEventDrag(dispatch, businessLogic, eventState, svgRef, id),
        }, {domTarget: ref})

        useGesture({
            onDrag: eventState => onEventStartDrag(dispatch, businessLogic, eventState, svgRef, id),
        }, {domTarget: startRef})

        useGesture({
            onDrag: eventState => onEventEndDrag(dispatch, businessLogic, eventState, svgRef, id),
        }, {domTarget: endRef})

        // Define props
        let props = {
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
        }
        // @ts-ignore
        return <PresentationalComponent {...props} />
    }
    return React.memo(EventComponent)
}


export type TimelineGroupProps = {
    component?: EventComponentType
}

export const Events: React.FC<TimelineGroupProps> = ({component,}) => {
    let Component = component || DefaultEventComponent

    // Redux state
    let events = useEventIdsOrderedForPainting()
    let groups = useGroupIds()
    let eventToGroup = useEventAndGroupIds()
    let eventPositions = useEventPositionsInGroup()
    let groupHeights = useGroupHeights()
    let minHeight = useMinGroupHeight()
    let groupPadding = useGroupPadding()
    let eventDistance = useEventMargin()
    let eventHeight = useEventHeight()

    // Calculated state
    // TODO: Move into Redux selector
    let groupHeightsPixel = useMemo(() => {
        return Object.fromEntries(groups.map(groupId => [groupId, Math.max(minHeight, eventHeight * groupHeights[groupId] + eventDistance * Math.max(groupHeights[groupId] - 1, 0) + groupPadding)]))
    }, [minHeight, eventHeight, groupHeights, eventDistance, groupPadding])

    let groupYs = useMemo(() => {
        return groups.reduce<[number, Record<string, number>]>((agg, groupId) => {
            return [agg[0] + groupHeightsPixel[groupId], {...agg[1], [groupId]: agg[0]}]
        }, [0, {}])[1]
    }, [groupHeightsPixel, groups])

    let eventYs = useMemo(() => {
        return Object.fromEntries(events.map(eventId => [eventId, groupPadding / 2 + (eventHeight + eventDistance) * eventPositions[eventId] + groupYs[eventToGroup[eventId]]]))
    }, [events, groupPadding, eventHeight, eventDistance, eventPositions, groupYs, eventToGroup])

    return <>
        <Foreground>
            <DragOffset>
                {events.map((eventId) => {
                    return <React.Fragment key={eventId}>
                        <Component
                            id={eventId}
                            eventHeight={eventHeight}
                            y={eventYs[eventId]}
                            groupHeight={groupHeightsPixel[eventToGroup[eventId]]}/>
                    </React.Fragment>
                })}
            </DragOffset>
        </Foreground>
    </>
}


const onEventDrag = (dispatch: Dispatch, config: BusinessLogic, eventState: EventState<'drag'>, svgRef: RefObject<SVGSVGElement>, id: string) => {
    eventState.event.stopPropagation()
    let {movement: [dx], last, tap, distance, xy, down} = eventState

    if (tap) {
        document.ontouchmove = function () {
            return true
        }
        let action: Thunk = async (dispatch) => {
            dispatch(toggleEventSelection({id}))
        }
        dispatch(action)
        return
    }

    if (down) {
        // Prevent scroll on touch screens while dragging:
        document.ontouchmove = function (e) {
            e.preventDefault()
        }
    } else {
        document.ontouchmove = function () {
            return true
        }
    }

    if (distance === 0) {
        return
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
    eventState.event.stopPropagation()

    let {movement: [dx], last, tap, down} = eventState

    if (tap) {
        document.ontouchmove = function () {
            return true
        }
        return
    }

    if (down) {
        // Prevent scroll on touch screens while dragging:
        document.ontouchmove = function (e) {
            e.preventDefault()
        }
    } else {
        document.ontouchmove = function () {
            return true
        }
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
    eventState.event.stopPropagation()
    let {movement: [dx], last, tap, down} = eventState

    if (tap) {
        document.ontouchmove = function () {
            return true
        }
        return
    }

    if (down) {
        // Prevent scroll on touch screens while dragging:
        document.ontouchmove = function (e) {
            e.preventDefault()
        }
    } else {
        document.ontouchmove = function () {
            return true
        }
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