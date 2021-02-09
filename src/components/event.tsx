import React, {MutableRefObject, RefObject, useCallback, useMemo, useRef} from 'react'
import {animated, to, useSpring} from 'react-spring'
import {useDrag} from 'react-use-gesture'
import {useBusinessLogic, useTimePerPixelSpring} from '../context'
import {
    resetDragOrResize,
    Thunk,
    toggleEventSelection,
    updateEvents,
    updateEventsIntermediary,
    updateGroups,
    updateGroupsIntermediary
} from '../store/actions'
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
    useMapEventIdToProps,
    useMapEventIdToSelected,
    useSpringConfig,
} from '../store/hooks'
import {Dispatch, useDispatch} from '../store'
import {BusinessLogic} from '../store/businessLogic'
import {
    selectEvents,
    selectGroups,
    selectInternalEventData,
    selectNumberOfSelectedEvents,
    selectSelectedEvents,
    selectTimePerPixel,
} from '../store/selectors'
import {OnEventSpace, useCanvasContext} from '../context/canvasContext'
import {DefaultEventComponent} from '../presentational/event'
import {activateBodyScroll, boundingBoxRelativeToSVGRoot, deactivateBodyScroll} from '../functions/misc'
import {PureInterval} from '../store/reducers/events'
import {RequiredEventData, RequiredGroupData} from "../store/shape"

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

export type EventComponentProps<T extends any> = {
    id: string
    eventHeight?: number
    groupHeight?: number
    interval: PureInterval
    eventProps: T
    selected: boolean
}

export type EventComponentType<T = {}> = React.FC<Omit<EventComponentProps<T>, keyof PresentationalEventComponentProps> & {y: number, groupHeight?: number, selected: boolean}>


export function createEventComponent<T>(component: React.FC<T>) {
    let EventComponent: EventComponentType<T> = (
        {
            id,
            y,
            eventHeight = 20,
            groupHeight,
            interval,
            eventProps,
            selected,
        }) => {
        let PresentationalComponent = animated(component)

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
        let canvasContext = useCanvasContext()
        let {svg: svgRef} = canvasContext

        // Refs
        let ref = useRef<SVGGeometryElement>(null)
        let startRef = useRef<SVGGeometryElement>(null)
        let endRef = useRef<SVGGeometryElement>(null)

        // Callbacks
        let onDrag = useCallback((eventState: EventState<'drag'>) => onEventDrag(dispatch, businessLogic, eventState, svgRef, id), [dispatch, businessLogic, svgRef, id])
        let onDragStart = useCallback((eventState: EventState<'drag'>) => onEventStartDrag(dispatch, businessLogic, eventState, svgRef, id), [dispatch, businessLogic, svgRef, id])
        let onDragEnd = useCallback((eventState: EventState<'drag'>) => onEventEndDrag(dispatch, businessLogic, eventState, svgRef, id), [dispatch, businessLogic, svgRef, id])

        // Springs
        let [{ySpring}] = useSpring({
            ySpring: y,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, animate, initialized, y])

        let [{intervalStartSpring}] = useSpring({
            intervalStartSpring: interval.start,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, animate, initialized, interval.start])

        let [{intervalEndSpring}] = useSpring({
            intervalEndSpring: interval.end,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, animate, initialized, interval.end])

        let [{groupHeightSpring}] = useSpring({
            groupHeightSpring: groupHeight,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, animate, initialized, groupHeight])

        let xInterpolator = useCallback((a, b) => (b.valueOf() - dateZero.valueOf()) / a.valueOf(), [dateZero])
        let widthInterpolator = useCallback((timePerPixel, intervalStart, intervalEnd) => (intervalEnd.valueOf() - intervalStart.valueOf()) / timePerPixel.valueOf(), [])

        // Interpolations
        let xSpring = to([timePerPixelSpring, intervalStartSpring], xInterpolator)
        let widthSpring = to([timePerPixelSpring, intervalStartSpring, intervalEndSpring], widthInterpolator)

        // Attach gestures
        useDrag(onDrag, {domTarget: ref})
        useDrag(onDragStart, {domTarget: startRef})
        useDrag(onDragEnd, {domTarget: endRef})

        // @ts-ignore
        return <PresentationalComponent
            {...eventProps}
            eventId={id}
            x={xSpring}
            y={ySpring}
            width={widthSpring}
            height={eventHeight}
            groupHeight={groupHeightSpring}
            selected={selected}
            dragHandle={ref}
            dragStartHandle={startRef}
            dragEndHandle={endRef}/>
    }
    return React.memo(EventComponent)
}


export type TimelineGroupProps = {
    component?: React.FC<PresentationalEventComponentProps>
}

export const Events_ = React.memo(
    function Events({component = DefaultEventComponent}: TimelineGroupProps) {
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
        let mapEventToProps = useMapEventIdToProps()
        let groupHeightsPixel = useGroupHeights()
        let eventYs = useEventYs()

        return <>
            {events.map((eventId) => <Component
                    key={eventId}
                    id={eventId}
                    eventHeight={eventHeight}
                    y={eventYs[eventId]}
                    groupHeight={groupHeightsPixel[eventToGroup[eventId]]}
                    interval={mapEventToInterval[eventId]}
                    selected={mapEventToSelected[eventId]}
                    // @ts-ignore
                    eventProps={mapEventToProps[eventId]}
                />,
            )}
        </>
    })

export const Events: React.FC<TimelineGroupProps> = ({component = DefaultEventComponent}) => {
    return <OnEventSpace>
        <DragOffset>
            <Events_ component={component}/>
        </DragOffset>
    </OnEventSpace>
}


function onEventDrag<E extends RequiredEventData, G extends RequiredGroupData, E_ extends {}, G_ extends {}>(dispatch: Dispatch<E, G>, config: BusinessLogic<E, G, E_, G_>, eventState: EventState<'drag'>, svgRef: RefObject<SVGSVGElement>, id: string) {
    let {movement: [dx], last, tap, distance, xy, pinching} = eventState

    if (tap) {
        let action: Thunk<E, G> = async (dispatch) => {
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

    let action: Thunk<E, G> = async (dispatch, getState) => {
        let state = getState()
        let numberOfSelectedEvents = selectNumberOfSelectedEvents(config)(state)
        let currentEvents = selectEvents(config)(state)
        let currentGroups = selectGroups(config)(state)
        let internalEventData = selectInternalEventData(config)(state)

        let selectedEvents
        if (numberOfSelectedEvents === 0) {
            selectedEvents = {[id]: currentEvents[id]}
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
                if (groupId !== currentEvents[id].groupId && y >= position.y && y < (position.y + position.height)) {
                    newGroupId = groupId
                    break
                }
                if (groupId !== currentEvents[id].groupId && y >= position.y - buffer && y < (position.y + position.height + buffer)) {
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
            let {updatedEvents, deletedEvents, updatedGroups, deletedGroups} = config.validateDuringDrag({
                manipulatedEventId: id,
                newIntervals: newIntervals,
                newGroupAssignments: newGroups,
                currentEvents: currentEvents,
                currentGroups: currentGroups
            })
            if (updatedEvents || deletedEvents) {
                dispatch(updateEventsIntermediary({updatedEvents, deletedEvents}))
            }
            if (updatedGroups || deletedGroups) {
                dispatch(updateGroupsIntermediary({updatedGroups, deletedGroups}))
            }
        } else {
            try {
                let {updatedEvents, deletedEvents, updatedGroups, deletedGroups} = await config.validateAfterDrag({
                    manipulatedEventId: id,
                    newIntervals: newIntervals,
                    newGroupAssignments: newGroups,
                    currentEvents: currentEvents,
                    currentGroups: currentGroups
                })
                if (updatedEvents || deletedEvents) {
                    dispatch(updateEvents({updatedEvents, deletedEvents}))
                }
                if (updatedGroups || deletedGroups) {
                    dispatch(updateGroups({updatedGroups, deletedGroups}))
                }
            } catch (e) {
                dispatch(resetDragOrResize())
            }
        }
    }
    dispatch(action)
}

function onEventStartDrag<E extends RequiredEventData, G extends RequiredGroupData, E_ extends {}, G_ extends {}>(dispatch: Dispatch<E, G>, config: BusinessLogic<E, G, E_, G_>, eventState: EventState<'drag'>, _: RefObject<SVGSVGElement>, id: any) {
    let {movement: [dx], last, pinching} = eventState

    if (pinching) {
        return
    }

    deactivateBodyScroll(document)
    if (last) {
        activateBodyScroll(document)
    }


    let action: Thunk<E, G> = async (dispatch, getState) => {
        let state = getState()
        let currentEvents = selectEvents(config)(state)
        let currentGroups = selectGroups(config)(state)
        let event = currentEvents[id]
        let internalEventData = selectInternalEventData(config)(state)

        let selectedEvents = selectSelectedEvents(config)(state)
        if (!selectedEvents[id]) {
            return
        }

        let oldInterval = internalEventData?.[id]?.initialInterval || event.interval
        let timePerPixel = selectTimePerPixel(config)(state)

        let dt = dx * timePerPixel
        let newInterval = {
            start: oldInterval.start + dt,
            end: oldInterval.end,
        }
        if (!last) {
            let {updatedEvents, deletedEvents, updatedGroups, deletedGroups} = config.validateDuringResize({
                manipulatedEventId: id,
                newIntervals: {[id]: newInterval},
                currentEvents,
                currentGroups,
            })
            if (updatedEvents || deletedEvents) {
                dispatch(updateEventsIntermediary({updatedEvents, deletedEvents}))
            }
            if (updatedGroups || deletedGroups) {
                dispatch(updateGroupsIntermediary({updatedGroups, deletedGroups}))
            }
        } else {
            try {
                let {updatedEvents, deletedEvents, updatedGroups, deletedGroups} = await config.validateAfterResize({
                    manipulatedEventId: id,
                    newIntervals: {[id]: newInterval},
                    currentEvents,
                    currentGroups
                })
                if (updatedEvents || deletedEvents) {
                    dispatch(updateEvents({updatedEvents, deletedEvents}))
                }
                if (updatedGroups || deletedGroups) {
                    dispatch(updateGroups({updatedGroups, deletedGroups}))
                }
            } catch (e) {
                dispatch(resetDragOrResize())
            }
        }
    }
    dispatch(action)

}

function onEventEndDrag<E extends RequiredEventData, G extends RequiredGroupData, E_ extends {}, G_ extends {}>(dispatch: Dispatch<E, G>, config: BusinessLogic<E, G, E_, G_>, eventState: EventState<'drag'>, _: RefObject<SVGSVGElement>, id: any) {
    let {movement: [dx], last, pinching} = eventState

    if (pinching) {
        return
    }

    deactivateBodyScroll(document)
    if (last) {
        activateBodyScroll(document)
    }

    let action: Thunk<E, G> = async (dispatch, getState) => {
        let state = getState()
        let currentEvents = selectEvents(config)(state)
        let currentGroups = selectGroups(config)(state)
        let event = currentEvents[id]
        let internalEventData = selectInternalEventData(config)(state)

        let selectedEvents = selectSelectedEvents(config)(state)
        if (!selectedEvents[id]) {
            return
        }

        let oldInterval = internalEventData?.[id]?.initialInterval || event.interval
        let timePerPixel = selectTimePerPixel(config)(state)

        let dt = dx * timePerPixel
        let newInterval = {
            start: oldInterval.start,
            end: oldInterval.end + dt,
        }

        if (!last) {
            let {updatedEvents, deletedEvents, updatedGroups, deletedGroups} = config.validateDuringResize({
                manipulatedEventId: id,
                newIntervals: {[id]: newInterval},
                currentEvents: currentEvents,
                currentGroups: currentGroups
            })
            if (updatedEvents || deletedEvents) {
                dispatch(updateEventsIntermediary({updatedEvents, deletedEvents}))
            }
            if (updatedGroups || deletedGroups) {
                dispatch(updateGroupsIntermediary({updatedGroups, deletedGroups}))
            }
        } else {
            try {
                let {updatedEvents, deletedEvents, updatedGroups, deletedGroups} = await config.validateAfterResize({
                    manipulatedEventId: id,
                    newIntervals: {[id]: newInterval},
                    currentEvents,
                    currentGroups
                })
                if (updatedEvents || deletedEvents) {
                    dispatch(updateEvents({updatedEvents, deletedEvents}))
                }
                if (updatedGroups || deletedGroups) {
                    dispatch(updateGroups({updatedGroups, deletedGroups}))
                }
            } catch (e) {
                dispatch(resetDragOrResize())
            }
        }
    }
    dispatch(action)
}