import React, {CSSProperties, useCallback, useEffect, useRef} from 'react'
import {useGesture} from '@use-gesture/react'
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock'
import {Handler} from '@use-gesture/core/src/types/handlers'

import {useCanvasStore, useCanvasStoreApi, useTimePerPixelSpring, useTimeStartSpring} from "./canvasStore"
import './canvas.css'

type CanvasProps = {
    width?: CSSProperties["width"]
    height?: CSSProperties["height"]
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
const WheelThrottle = 2
const PinchThrottle = 2
const DragThrottle = 1

export const Canvas: React.FC<CanvasProps> = React.memo(({width, height, children}) => {
    let ref = useRef<HTMLDivElement>(null)

    // Global state
    let canvasStoreApi = useCanvasStoreApi()

    // State updates
    let setWidth = useCanvasStore(state => state.setContainerWidth)
    let setHeight = useCanvasStore(state => state.setContainerHeight)
    let setOffsetLeft = useCanvasStore(state => state.setContainerLeft)
    let setTimeStart = useCanvasStore(state => state.setTimeStart)
    let setTimePerPixel = useCanvasStore(state => state.setTimePerPixel)
    let setScrollOffset = useCanvasStore(state => state.setScrollOffset)

    // Springs
    let timePerPixelSpring = useTimePerPixelSpring()
    let timeStartSpring = useTimeStartSpring()

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

    // Track the size of the container div and its left Border (to reduce layout thrashing)
    const resizeCallback = useCallback<ResizeObserverCallback>((result) => {
        setWidth(result[0].contentRect.width)
        setHeight(result[0].contentRect.height)
        setOffsetLeft(result[0].contentRect.left)
    }, [setHeight, setOffsetLeft, setWidth])

    useEffect(() => {
        if (ref.current) {
            const observer = new ResizeObserver(resizeCallback)
            observer.observe(ref.current)
            return () => observer.disconnect()
        }
    }, [resizeCallback])

    // Dragging callback
    let dragRoot = useRef<number>(0)
    let wasPinching = useRef<boolean>(false)
    let dragEventCount = useRef(1)
    let onDragCallback = useCallback<Handler<'drag'>>((state) => {
        let {containerLeft, timePerPixel, timeStart, scrollOffset} = canvasStoreApi.getState()

        let x = (state.xy[0] - containerLeft)
        if (state.first || wasPinching.current) {
            dragRoot.current = timeStart + x * timePerPixel
        } else {
            if (dragEventCount.current % DragThrottle == 0) {
                setTimeStart(dragRoot.current - x * timePerPixel)
                setScrollOffset(scrollOffset - state.delta[1])
                dragEventCount.current = 0
            }
            dragEventCount.current += 1
        }
        wasPinching.current = !!state.pinching
    }, [canvasStoreApi, setScrollOffset, setTimeStart])

    // Zooming (wheel) callback
    let wheelEventCount = useRef(1)
    let onWheelCallback = useCallback<Handler<'wheel'>>((state) => {
        if (state.altKey) {
            let {containerLeft: offsetLeft, timePerPixel, timeStart} = canvasStoreApi.getState()
            if (wheelEventCount.current % WheelThrottle == 0) {
                let x = state.event.clientX - offsetLeft
                let center = timeStart + x * timePerPixel
                let scale = 1 - 0.05 * WheelThrottle
                let factor = state.delta[1] > 0 ? scale : 1 / scale

                let newTimeStart = center - (center - timeStart) * factor
                let newTimePerPixel = factor * timePerPixel

                if (newTimePerPixel < MaxTimePerPixel && newTimePerPixel > MinTimePerPixel) {
                    setTimeStart(newTimeStart)
                    setTimePerPixel(newTimePerPixel)
                }
                wheelEventCount.current = 0
            }
            wheelEventCount.current += 1
        }
    }, [canvasStoreApi, setTimePerPixel, setTimeStart])

    // Zooming (pinching) callback
    let leftPinchTime = useRef<number>()
    let rightPinchTime = useRef<number>()
    let pinchEventCount = useRef(1)
    let onPinchCallback = useCallback<Handler<'pinch'>>((state) => {
        let [p1, p2] = calculatePinchPoints(state.origin, state.da)
        let {containerLeft: offsetLeft} = canvasStoreApi.getState()
        if (state.first) {
            let [t1, t2] = [p1[0], p2[0]].map(x => timeStartSpring.get() + (x - offsetLeft) * timePerPixelSpring.get())
            leftPinchTime.current = t1
            rightPinchTime.current = t2
        }
        if (pinchEventCount.current % PinchThrottle == 0) {
            if (leftPinchTime.current && rightPinchTime.current) {
                let newTimePerPixel = Math.abs((leftPinchTime.current - rightPinchTime.current) / (p1[0] - p2[0]))
                let newTimeStart = leftPinchTime.current - p1[0] * newTimePerPixel
                if (newTimePerPixel < MaxTimePerPixel && newTimePerPixel > MinTimePerPixel) {
                    setTimeStart(newTimeStart)
                    setTimePerPixel(newTimePerPixel)
                }
            }
            pinchEventCount.current = 0
        }
        pinchEventCount.current = pinchEventCount.current + 1
    }, [canvasStoreApi, setTimePerPixel, setTimeStart, timePerPixelSpring, timeStartSpring])

    // Attach gestures
    const bind = useGesture(
        {
            onDrag: onDragCallback,
            onWheel: onWheelCallback,
            onPinch: onPinchCallback,
        },
        {
            drag: {
                axis: "lock"
            }
        }
    )

    // Render
    return <div style={{width, height}} ref={ref} className={'canvas'} {...bind()}>
        <svg width={'100%'} height={'100%'}>
            {children}
        </svg>
    </div>
})

Canvas.displayName = "Canvas"
