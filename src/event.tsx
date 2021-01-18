import React, {MutableRefObject, useRef} from 'react'
import {animated, to, useSpring} from 'react-spring'
import {useGesture} from 'react-use-gesture'
import {useDispatch} from 'react-redux'
import {useTimePerPixelSpring} from './context'
import {
    dragEvent,
    dragEventEnd,
    dragEventStart,
    stopEventDrag,
    stopEventEndDrag,
    stopEventStartDrag
} from "./store/actions"
import {Dispatch as ReduxDispatch} from "redux"
import {EventState} from "./canvas"
import {useAnimate, useDateZero, useGetInterval, useInitialized, useSpringConfig} from "./store/hooks"

export type EventPresentationalComponentProps = {
    x: number,
    y: number,
    width: number,
    height: number,
    dragHandle: MutableRefObject<any>,
    dragStartHandle: MutableRefObject<any>,
    dragEndHandle: MutableRefObject<any>
}
export type EventComponentType<T = {}> = React.FC<EventPresentationalComponentProps & T>

export type EventComponentProps<T = {}> = {
    id: string
} & T


export const onEventDrag = (dispatch: ReduxDispatch, eventState: EventState<'drag'>, id: any) => {
    eventState.event.stopPropagation()

    let {movement: [dx], last} = eventState

    dragEvent(dispatch, {id, pixels: dx})

    if (last) {
        stopEventDrag(dispatch, {id})
    }

}

export const onEventStartDrag = (dispatch: ReduxDispatch, eventState: EventState<'drag'>, id: any) => {
    eventState.event.stopPropagation()

    let {movement: [dx], last} = eventState

    dragEventStart(dispatch, {id, pixels: dx})

    if (last) {
        stopEventStartDrag(dispatch, {id})
    }
}

export const onEventEndDrag = (dispatch: ReduxDispatch, eventState: EventState<'drag'>, id: any) => {
    eventState.event.stopPropagation()

    let {movement: [dx], last} = eventState

    dragEventEnd(dispatch, {id, pixels: dx})

    if (last) {
        stopEventEndDrag(dispatch, {id})
    }
}

export function createEventComponent<T>(component: React.FC<T>): React.FC<Omit<EventComponentProps<T>, keyof EventPresentationalComponentProps>> {
    return ({id}) => {
        let ref = useRef<SVGRectElement>(null)
        let startRef = useRef<SVGRectElement>(null)
        let endRef = useRef<SVGRectElement>(null)
        let dispatch = useDispatch()

        let interval = useGetInterval(id)


        let dateZero = useDateZero()
        let animate = useAnimate()
        let initialized = useInitialized()
        let springConfig = useSpringConfig()
        let timePerPixelSpring = useTimePerPixelSpring()

        let [{ySpring, intervalStartSpring, intervalEndSpring}] = useSpring({
            intervalStartSpring: interval.start,
            intervalEndSpring: interval.end,
            ySpring: 0,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, 0, interval.start, interval.end, animate, initialized])

        let xSpring = to([timePerPixelSpring, intervalStartSpring], (timePerPixel, intervalStart) => (intervalStart.valueOf() - dateZero.valueOf()) / timePerPixel.valueOf())
        let widthSpring = to([timePerPixelSpring, intervalStartSpring, intervalEndSpring], (timePerPixel, intervalStart, intervalEnd) => (intervalEnd.valueOf() - intervalStart.valueOf()) / timePerPixel.valueOf())

        useGesture({
            onDrag: eventState => onEventDrag(dispatch, eventState, id),
        }, {domTarget: ref, eventOptions: {passive: false}})

        useGesture({
            onDrag: eventState => onEventStartDrag(dispatch, eventState, id),
        }, {domTarget: startRef, eventOptions: {passive: false}})

        useGesture({
            onDrag: eventState => onEventEndDrag(dispatch, eventState, id),
        }, {domTarget: endRef, eventOptions: {passive: false}})

        let PresentationalComponent = animated(component)

        let props = {
            x: xSpring,
            y: ySpring,
            width: widthSpring,
            height: 20,
            dragHandle: ref,
            dragStartHandle: startRef,
            dragEndHandle: endRef,
        }

        // @ts-ignore
        return <PresentationalComponent {...props} />
    }
}
