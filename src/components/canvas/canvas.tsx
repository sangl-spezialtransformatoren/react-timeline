import React, {CSSProperties, useCallback, useEffect, useLayoutEffect, useRef} from 'react'
import {useGesture} from '@use-gesture/react'
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock'
import {Handler} from '@use-gesture/core/src/types/handlers'

import {
    CanvasStoreContext,
    SpringContext,
    useCanvasHeight,
    useCanvasOffsetLeft,
    useCanvasStore,
    useCanvasWidth,
    useRealign,
    useTimePerPixel,
    useTimePerPixelAnchor,
    useTimeStart,
    useTimeZero,
} from './canvasStore'
import './canvas.css'
import {Layer, Stage} from 'react-konva'
import Konva from 'konva'
import FastLayer = Konva.FastLayer

type CanvasProps = {
    width?: CSSProperties['width']
    height?: CSSProperties['height']
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

export const Canvas: React.FC<CanvasProps> = React.memo(({width, height, children}) => {
    let ref = useRef<HTMLDivElement>(null)

    // Global state
    let offsetLeft = useCanvasOffsetLeft()
    let timeZero = useTimeZero()
    let timeStart = useTimeStart()
    let timePerPixelAnchor = useTimePerPixelAnchor()
    let timePerPixel = useTimePerPixel()
    let realign = useRealign()

    // State updates
    let setWidth = useCanvasStore(state => state.setWidth)
    let setHeight = useCanvasStore(state => state.setHeight)
    let setOffsetLeft = useCanvasStore(state => state.setOffsetLeft)
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

    // Realign points when dragging or scaling away to avoid discretization issues
    useEffect(() => {
        if ((Math.abs((timeStart.valueOf() - timeZero.valueOf()) / timePerPixel) > 1000) || Math.abs(Math.log(timePerPixel / timePerPixelAnchor)) > 0.13) {
            realign()
        }
    }, [timeStart, timeZero, timePerPixel, timePerPixelAnchor, setTimeZero, setTimePerPixelAnchor, realign])

    // Dragging callback
    let dragRoot = useRef<number>(timeStart)
    let wasPinching = useRef<boolean>(false)
    let onDragCallback = useCallback<Handler<'drag'>>((state) => {
        let x = (state.xy[0] - offsetLeft)
        if (state.first || wasPinching.current) {
            dragRoot.current = timeStart + x * timePerPixel
        } else {
            setTimeStart(dragRoot.current - x * timePerPixel)
        }
        wasPinching.current = !!state.pinching
    }, [offsetLeft, setTimeStart, timePerPixel, timeStart])

    // Zooming (wheel) callback
    let onWheelCallback = useCallback<Handler<'wheel'>>((state) => {
        if (state.altKey) {
            let x = state.event.clientX - offsetLeft
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
    }, [offsetLeft, setTimePerPixel, setTimeStart, timePerPixel, timeStart])

    // Zooming (pinching) callback
    let leftPinchTime = useRef<number>()
    let rightPinchTime = useRef<number>()
    let onPinchCallback = useCallback<Handler<'pinch'>>((state) => {
        let [p1, p2] = calculatePinchPoints(state.origin, state.da)
        if (state.first) {
            let [t1, t2] = [p1[0], p2[0]].map(x => timeStart + (x - offsetLeft) * timePerPixel)
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
    }, [offsetLeft, setTimePerPixel, setTimeStart, timePerPixel, timeStart])

    // Attach gestures
    const bind = useGesture({
        onDrag: onDragCallback,
        onWheel: onWheelCallback,
        onPinch: onPinchCallback,
    })

    // Render
    let canvasWidth = useCanvasWidth()
    let canvasHeight = useCanvasHeight()


    return <div style={{width, height}} ref={ref} className={'canvas'} {...bind()}>
        <CanvasStoreContext.Consumer>
            {value1 => <SpringContext.Consumer>{
                value2 => <Stage width={canvasWidth} height={canvasHeight} listening={false}>
                    <Layer>
                        <CanvasStoreContext.Provider value={value1}>
                            <SpringContext.Provider value={value2}>
                                {children}
                            </SpringContext.Provider>
                        </CanvasStoreContext.Provider>
                    </Layer>
                </Stage>}
            </SpringContext.Consumer>
            }
        </CanvasStoreContext.Consumer>
    </div>
})

Canvas.displayName = 'Canvas'
