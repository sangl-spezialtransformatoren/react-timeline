import React, {useCallback, useEffect, useRef} from 'react'
import create from 'zustand'
import {useGesture} from '@use-gesture/react'
import {animated, to, useSpring} from '@react-spring/web'
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock'
import {Handler} from '@use-gesture/core/src/types/handlers'

import './canvas.css'

export type CanvasStoreShape = {
    width: number
    height: number
    timeZero: number
    timePerPixel: number
    timePerPixelAnchor: number
    timeStart: number
    setWidth: (_: number) => unknown
    setHeight: (_: number) => unknown
    setTimeZero: (_: number) => unknown
    setTimePerPixel: (_: number) => unknown
    setTimePerPixelAnchor: (_: number) => unknown
    setTimeStart: (_: number) => unknown,
    realign: () => unknown
}

export const useCanvasStore = create<CanvasStoreShape>(set => ({
    width: 600,
    height: 400,
    timeZero: new Date().valueOf(),
    timePerPixel: 172800,
    timePerPixelAnchor: 172800,
    timeStart: new Date().valueOf(),
    setWidth: (width: number) => set(state => ({...state, width})),
    setHeight: (height: number) => set(state => ({...state, height})),
    setTimeZero: (timeZero: number) => set(state => ({...state, timeZero})),
    setTimePerPixel: (timePerPixel: number) => set(state => ({...state, timePerPixel})),
    setTimeStart: (timeStart: number) => set(state => ({...state, timeStart})),
    setTimePerPixelAnchor: (timePerPixelAnchor: number) => set(state => ({...state, timePerPixelAnchor})),
    realign: () => set(state => ({...state, timePerPixelAnchor: state.timePerPixel, timeZero: state.timeStart}))
}))

export const useTimeZero = () => {
    return useCanvasStore(state => state.timeZero)
}

export const useTimeStart = () => {
    return useCanvasStore(state => state.timeStart)
}

export const useTimePerPixel = () => {
    return useCanvasStore(state => state.timePerPixel)
}

export const useTimePerPixelAnchor = () => {
    return useCanvasStore(state => state.timePerPixelAnchor)
}

export const useCanvasHeight = () => {
    return useCanvasStore(state => state.height)
}

export const useCanvasWidth = () => {
    return useCanvasStore(state => state.width)
}

export const useRealign = () => {
    return useCanvasStore(state => state.realign)
}

type CanvasProps = {
    width?: string | number
    height?: string | number
}

function calculatePinchPoints(center: [number, number], da: [number, number]) {
    let [distance, angle] = da
    let [cx, cy] = center
    let dX = Math.sin(angle / 360 * 2 * Math.PI) * distance
    let dY = Math.cos(angle / 360 * 2 * Math.PI) * distance
    return [[cx + dX / 2, cy + dY / 2], [cx - dX / 2, cy - dY / 2]].sort((a, b) => a[0] - b[0])
}

const MaxTimePerPixel = 6.3e8
const MinTimePerPixel = 2

export const Canvas: React.FC<CanvasProps> = ({width, height, children}) => {
    let ref = useRef<HTMLDivElement>(null)

    // Global state
    let timeZero = useTimeZero()
    let timeStart = useTimeStart()
    let timePerPixelAnchor = useTimePerPixelAnchor()
    let timePerPixel = useTimePerPixel()
    let realign = useRealign()

    // State updates
    let setWidth = useCanvasStore(state => state.setWidth)
    let setHeight = useCanvasStore(state => state.setHeight)
    let setTimeZero = useCanvasStore(state => state.setTimeZero)
    let setTimeStart = useCanvasStore(state => state.setTimeStart)
    let setTimePerPixel = useCanvasStore(state => state.setTimePerPixel)
    let setTimePerPixelAnchor = useCanvasStore(state => state.setTimePerPixelAnchor)

    // Disable body scroll on canvas
    useEffect(() => {
        let canvas: HTMLDivElement | undefined
        if (ref.current) {
            canvas = ref.current
            disableBodyScroll(canvas)
        }
        return () => {
            if (canvas) {
                enableBodyScroll(canvas)
            }
        }
    }, [])

    // Track the size of the container div
    const resizeCallback = useCallback<ResizeObserverCallback>((result) => {
        setWidth(result[0].contentRect.width)
        setHeight(result[0].contentRect.height)
    }, [setHeight, setWidth])

    useEffect(() => {
        if (ref.current) {
            const observer = new ResizeObserver(resizeCallback)
            observer.observe(ref.current)
            return () => observer.disconnect()
        }
    }, [resizeCallback])

    // Realign points when dragging or scaling away to avoid discretization issues
    useEffect(() => {
        if ((Math.abs((timeStart.valueOf() - timeZero.valueOf()) / timePerPixel) > 1000) || Math.abs(Math.log(timePerPixel / timePerPixelAnchor)) > 0.13) {
            realign()
        }
    }, [timeStart, timeZero, timePerPixel, timePerPixelAnchor, setTimeZero, setTimePerPixelAnchor, realign])

    // Dragging
    let dragRoot = useRef<number>(timeStart)
    let wasPinching = useRef<boolean>(false)
    let onDragCallback = useCallback<Handler<'drag'>>((state) => {
        let x = (state.xy[0] - (ref.current?.offsetLeft || 0))
        if (state.first || wasPinching.current) {
            dragRoot.current = timeStart + x * timePerPixel
        } else {
            setTimeStart(dragRoot.current - x * timePerPixel)
        }
        wasPinching.current = !!state.pinching
    }, [setTimeStart, timePerPixel, timeStart])

    // Zooming (wheel)
    let onWheelCallback = useCallback<Handler<'wheel'>>((state) => {
        if (state.altKey) {
            let x = state.event.clientX - (ref.current?.offsetLeft || 0)
            let center = timeStart + x * timePerPixel
            let scale = 0.95
            let factor = state.delta[1] > 0 ? scale : 1 / scale

            let newTimeStart = center - (center - timeStart) * factor
            let newTimePerPixel = factor * timePerPixel

            if (newTimePerPixel < MaxTimePerPixel && newTimePerPixel > MinTimePerPixel) {
                setTimeStart(newTimeStart)
                setTimePerPixel(newTimePerPixel)
            }
        }
    }, [setTimePerPixel, setTimeStart, timePerPixel, timeStart])

    // Zooming (pinching)
    let leftPinchTime = useRef<number>()
    let rightPinchTime = useRef<number>()
    let onPinchCallback = useCallback<Handler<'pinch'>>((state) => {
        let [p1, p2] = calculatePinchPoints(state.origin, state.da)
        if (state.first) {
            let [t1, t2] = [p1[0], p2[0]].map(x => timeStart + (x - (ref.current?.clientLeft || 0)) * timePerPixel)
            leftPinchTime.current = t1
            rightPinchTime.current = t2
        }

        if (leftPinchTime.current && rightPinchTime.current) {
            let newTimePerPixel = Math.abs((leftPinchTime.current - rightPinchTime.current) / (p1[0] - p2[0]))
            let newTimeStart = leftPinchTime.current - p1[0] * newTimePerPixel
            if (newTimePerPixel < MaxTimePerPixel && newTimePerPixel > MinTimePerPixel) {
                setTimeStart(newTimeStart)
                setTimePerPixel(newTimePerPixel)
            }
        }
    }, [setTimePerPixel, setTimeStart, timePerPixel, timeStart])

    const bind = useGesture({
        onDrag: onDragCallback,
        onWheel: onWheelCallback,
        onPinch: onPinchCallback,
    })

    // Animations
    let {timeStartSpring, timePerPixelSpring} = useSpring({
        timeStartSpring: timeStart,
        timePerPixelSpring: timePerPixel,
        onRest: realign,
        config: {
            mass: 1,
            tension: 210,
            friction: 28,
            clamp: true
        },
    })

    let timeOffset = to([timeStartSpring, timePerPixelSpring], (timeStart: number, timePerPixel) => `${(timeZero - timeStart) / timePerPixel}px`)
    let timeScaling = timePerPixelSpring.to((timePerPixel) => `${timePerPixelAnchor / timePerPixel}`)


    return <div style={{width, height}} ref={ref} className={'canvas'} {...bind()}>
        <animated.svg width={'100%'} height={'100%'}
                      style={{
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          '--time-offset': timeOffset,
                          '--time-scaling': timeScaling,
                      }}>
            {children}
        </animated.svg>
    </div>
}
