import React, {CSSProperties, useCallback, useRef} from 'react'
import {useSpring} from '@react-spring/web'
import {CanvasStoreContext, createCanvasStore} from './store'
import {useGesture} from '@use-gesture/react'

import {useResizeObserver} from "../../hooks/resizeObserver"

const DEFAULT_DECAY = 0.988
const MIN_PINCH_DISTANCE = 20

let initialState = {
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    timeStart: new Date().valueOf(),
    timePerPixel: 3600 * 1000 * 24 / 1200,
    config: {
        mass: 0.6,
        tension: 210,
        friction: 19
    }
}

function calculatePinchPoints(center: [number, number], da: [number, number]) {
    let [distance, angle] = da
    let [cx, cy] = center
    let dX = Math.sin(angle / 360 * 2 * Math.PI) * distance
    let dY = Math.cos(angle / 360 * 2 * Math.PI) * distance
    return [[cx + dX / 2, cy + dY / 2], [cx - dX / 2, cy - dY / 2]].sort((a, b) => a[0] - b[0])
}

export const Canvas: React.FC<{style?: CSSProperties}> = ({style, children}) => {
    let container = useRef<HTMLDivElement>(null)

    // Initialize springs and state
    let [{timeStart, timePerPixel, canvasWidth, canvasHeight}, api] = useSpring(() => initialState)
    let store = useRef(createCanvasStore({
        springApi: api,
        timeStart,
        timePerPixel,
        canvasWidth,
        canvasHeight
    }))

    // Handle drag and zoom
    // Offset to timeStart by current drag/pinch gesture
    let dragOffset = useRef(0) // Time offset induced by current drag gesture
    let pinchOffset = useRef(0) // Offset induced by current pinch/wheel gesture

    // Refs for storing variables needed to calculate the right timeStart/timePerPixel
    let gestureStartStartTime = useRef(initialState.timeStart) // startTime, when the gesture started
    let pinchStartDistance = useRef(0) // Initial x distance beteen pinch points
    let pinchStartOffset = useRef(0) // Offset X in pixels of the pinch start
    let pinchStartTimePerPixel = useRef(initialState.timePerPixel) // timePerPixel at start of pinch gesture
    useGesture(
        {
            onDrag: ({pinching, first, last, movement, velocity, down, direction}) => {
                if (first) {
                    if (!pinching) {
                        gestureStartStartTime.current = timeStart.get()
                    }
                }
                if (!gestureStartStartTime.current) {
                    return
                }
                dragOffset.current = movement[0] * timePerPixel.goal
                if (last) {
                    gestureStartStartTime.current = gestureStartStartTime.current - dragOffset.current
                }
                let momentum = !down
                api.start({
                    timeStart: gestureStartStartTime.current - dragOffset.current - pinchOffset.current,
                    immediate: down,
                    config: {
                        velocity: momentum ? -1 * direction[0] * velocity[0] * timePerPixel.goal : undefined,
                        decay: momentum ? DEFAULT_DECAY : false
                    }
                })
            },
            onPinch: ({first, dragging, last, down, origin, da}) => {
                let [p1, p2] = calculatePinchPoints(origin, da)
                let distanceX = Math.abs(p2[0] - p1[0])
                let centerX = 0.5 * (p1[0] + p2[0])
                // Restrict value, so factors -> infinity can't occur
                distanceX = Math.max(MIN_PINCH_DISTANCE, distanceX)

                if (first) {
                    if (!dragging) {
                        gestureStartStartTime.current = timeStart.get()
                    }
                    pinchStartDistance.current = distanceX
                    pinchStartTimePerPixel.current = timePerPixel.get()
                    pinchStartOffset.current = centerX
                    console.log(centerX)
                }
                let factor = pinchStartDistance.current / distanceX
                pinchOffset.current = (factor * pinchStartTimePerPixel.current - pinchStartTimePerPixel.current) * pinchStartOffset.current
                if (last) {
                    gestureStartStartTime.current = gestureStartStartTime.current - pinchOffset.current
                    pinchOffset.current = 0
                }
                api.start({
                    timePerPixel: factor * pinchStartTimePerPixel.current,
                    timeStart: gestureStartStartTime.current - (dragging ? dragOffset.current : 0) - pinchOffset.current,
                    immediate: down,
                    config: {
                        decay: false
                    }
                })
            },
            onWheel: ({event, delta, ctrlKey}) => {
                // To do: Use lethargy
                if (ctrlKey) {
                    event.preventDefault()
                    let currentTimeStart = timeStart.get()
                    let currentTimePerPixel = timePerPixel.get()
                    let factor = delta[1] > 0 ? 1 + delta[1] / 50 : 1 / (1 - delta[1] / 50)
                    let offset = currentTimePerPixel * (factor - 1) * event.offsetX
                    let nextTimeStart = currentTimeStart - offset
                    api.start({
                        timeStart: nextTimeStart,
                        timePerPixel: factor * currentTimePerPixel,
                        config: {
                            decay: false
                        }
                    })
                    // Reset state for drag/pinch gestures
                    gestureStartStartTime.current = nextTimeStart
                    dragOffset.current = 0
                    pinchOffset.current = 0
                }
            }
        },
        {
            target: container,
            pinch: {
                pinchOnWheel: false
            },
            wheel: {eventOptions: {passive: false}}
        }
    )

    let handleResize = useCallback(({width: _width, height: _height}: {width: number, height: number}) => {
        api.start({canvasWidth: _width, canvasHeight: _height})
    }, [api])

    useResizeObserver(container, handleResize)


    return <div style={{...style, touchAction: "none"}} ref={container}>
        <CanvasStoreContext.Provider value={store.current}>
            <svg style={{width: '100%', height: '100%'}}>
                {children}
            </svg>
        </CanvasStoreContext.Provider>
    </div>
}