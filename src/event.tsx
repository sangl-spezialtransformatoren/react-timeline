import React, {MutableRefObject, useRef} from 'react'
import {animated, to, useSpring} from 'react-spring'
import {useGesture} from 'react-use-gesture'
import {useDispatch} from 'react-redux'
import {useBusinessLogic, useTimePerPixelSpring} from './context'
import {resetDragOrResize, Thunk, toggleEventSelection, updateEvents, updateEventsIntermediary} from './store/actions'
import {EventState} from './canvas'
import {
    useAnimate,
    useDateZero,
    useEventProps,
    useGetInterval,
    useInitialized,
    useIsEventSelected,
    useSpringConfig,
} from './store/hooks'
import {Dispatch} from './store'
import {BusinessLogic} from './store/businessLogic'
import {
    selectEvents,
    selectGroupPositions,
    selectHeaderHeight,
    selectInternalEventData,
    selectNumberOfSelectedEvents,
    selectScrollOffset,
    selectSelectedEvents,
    selectTimePerPixel,
} from './store/selectors'

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

export type EventComponentType<T = {}> = React.FC<Omit<EventComponentProps<T>, keyof PresentationalEventComponentProps> & {y: number, groupHeight?: number}>

const onEventDrag = (dispatch: Dispatch, config: BusinessLogic, eventState: EventState<'drag'>, id: string) => {
    eventState.event.stopPropagation()
    let {movement: [dx], last, tap, distance, xy, down} = eventState

    if (tap) {
        document.ontouchmove = function() {
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
        document.ontouchmove = function(e) {
            e.preventDefault()
        }
    } else {
        document.ontouchmove = function() {
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
        let scrollOffset = selectScrollOffset(config)(state)
        let headerHeight = selectHeaderHeight(config)(state)
        let y = xy[1] + scrollOffset - headerHeight
        let groupPositions = selectGroupPositions(config)(state)
        let newGroupId: string = ''
        for (let [groupId, position] of Object.entries(groupPositions)) {
            if (groupId !== allEvents[id].groupId && y > position.y && y < (position.y + position.height)) {
                newGroupId = groupId
                break
            }
        }
        let newGroups: Record<string, string> = {}
        if (newGroupId !== '') {
            newGroups = Object.fromEntries(Object.keys(selectedEvents).map(eventId => [eventId, newGroupId]))
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

const onEventStartDrag = (dispatch: Dispatch, config: BusinessLogic, eventState: EventState<'drag'>, id: any) => {
    eventState.event.stopPropagation()

    let {movement: [dx], last, tap} = eventState

    if (tap) {
        return
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

const onEventEndDrag = (dispatch: Dispatch, config: BusinessLogic, eventState: EventState<'drag'>, id: any) => {
    eventState.event.stopPropagation()
    let {movement: [dx], last, tap} = eventState

    if (tap) {
        return
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
        let ref = useRef<SVGGeometryElement>(null)
        let startRef = useRef<SVGGeometryElement>(null)
        let endRef = useRef<SVGGeometryElement>(null)
        let dispatch = useDispatch()

        let interval = useGetInterval(id)
        let eventProps = useEventProps(id)
        let selected = useIsEventSelected(id)

        let dateZero = useDateZero()
        let animate = useAnimate()
        let initialized = useInitialized()
        let springConfig = useSpringConfig()
        let timePerPixelSpring = useTimePerPixelSpring()
        let businessLogic = useBusinessLogic()

        let [{ySpring, intervalStartSpring, intervalEndSpring, groupHeightSpring}] = useSpring({
            intervalStartSpring: interval.start,
            intervalEndSpring: interval.end,
            ySpring: y,
            groupHeightSpring: groupHeight,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, interval.start, interval.end, animate, initialized, y, groupHeight])

        let xSpring = to([timePerPixelSpring, intervalStartSpring], (timePerPixel, intervalStart) => (intervalStart.valueOf() - dateZero.valueOf()) / timePerPixel.valueOf())
        let widthSpring = to([timePerPixelSpring, intervalStartSpring, intervalEndSpring], (timePerPixel, intervalStart, intervalEnd) => (intervalEnd.valueOf() - intervalStart.valueOf()) / timePerPixel.valueOf())

        useGesture({
            onDrag: eventState => onEventDrag(dispatch, businessLogic, eventState, id),
        }, {domTarget: ref})

        useGesture({
            onDrag: eventState => onEventStartDrag(dispatch, businessLogic, eventState, id),
        }, {domTarget: startRef})

        useGesture({
            onDrag: eventState => onEventEndDrag(dispatch, businessLogic, eventState, id),
        }, {domTarget: endRef})

        let PresentationalComponent = animated(component)

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
    return EventComponent
}
