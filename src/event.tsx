import React, {MutableRefObject, useContext, useRef} from "react"
import {TimelineContext} from "./definitions"
import {animated, to, useSpring} from "react-spring"
import {useGesture} from "react-use-gesture"
import {useInitialized} from "./store/initialized"
import {useAnimate} from "./store/animate"
import {useSpringConfig} from "./store/springConfig"
import {useDispatch} from "react-redux"
import {useDateZero} from "./store/timeScale"

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
    interval: Interval,
    y: number,
    id: string
} & T

export function createEventComponent<T>(component: React.FC<T>): React.FC<Omit<EventComponentProps<T>, keyof EventPresentationalComponentProps> & { y: number }> {
    return ({interval, y, id}) => {
        let ref = useRef<SVGRectElement>(null)
        let startRef = useRef<SVGRectElement>(null)
        let endRef = useRef<SVGRectElement>(null)
        let dispatch = useDispatch()

        let {
            timePerPixelSpring,
            onEventDrag,
            onEventDragStart,
            onEventDragEnd,
            state,
            setState
        } = useContext(TimelineContext)


        let dateZero = useDateZero()
        let animate = useAnimate()
        let initialized = useInitialized()
        let springConfig = useSpringConfig()

        let [{ySpring, intervalStartSpring, intervalEndSpring}] = useSpring({
            intervalStartSpring: interval.start,
            intervalEndSpring: interval.end,
            ySpring: y,
            config: springConfig,
            immediate: !animate || !initialized
        }, [springConfig, y, interval.start, interval.end, animate, initialized])

        let xSpring = to([timePerPixelSpring, intervalStartSpring], (timePerPixel, intervalStart) => (intervalStart.valueOf() - dateZero.valueOf()) / timePerPixel.valueOf())
        let widthSpring = to([timePerPixelSpring, intervalStartSpring, intervalEndSpring], (timePerPixel, intervalStart, intervalEnd) => (intervalEnd.valueOf() - intervalStart.valueOf()) / timePerPixel.valueOf())

        useGesture({
            onDrag: eventState => onEventDrag?.({dispatch, state, setState, eventState, id})
        }, {domTarget: ref, eventOptions: {passive: false}})

        useGesture({
            onDrag: eventState => onEventDragStart?.({dispatch, state, setState, eventState, id})
        }, {domTarget: startRef, eventOptions: {passive: false}})

        useGesture({
            onDrag: eventState => onEventDragEnd?.({dispatch, state, setState, eventState, id})
        }, {domTarget: endRef, eventOptions: {passive: false}})

        let PresentationalComponent = animated(component)

        let props = {
            x: xSpring,
            y: ySpring,
            width: widthSpring,
            height: 20,
            dragHandle: ref,
            dragStartHandle: startRef,
            dragEndHandle: endRef
        }

        // @ts-ignore
        return <PresentationalComponent {...props}/>
    }
}
