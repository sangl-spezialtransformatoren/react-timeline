import {CanvasStoreShape, useCanvasStore} from '../components/canvas/canvasStore'
import {useMemo} from 'react'

function logRound(value: number, base = 2) {
    return base ** (Math.round(Math.log(value) / Math.log(base)))
}

function roundTo(value: number, size: number) {
    return size * Math.round(value / size)
}

const selector = (base: number, factor: number) => (state: CanvasStoreShape) => {
    const timeWidth = state.containerWidth * state.timePerPixel
    const timeEnd = state.timeStart + timeWidth

    // Use logarithmic rounding to find a scale independent quantization
    const quantization = logRound(timeWidth, base)
    const roundedTimeStart = roundTo(state.timeStart, quantization)
    const roundedTimeEnd = roundTo(timeEnd, quantization)

    const from = roundedTimeStart - factor * quantization
    const to = roundedTimeEnd + factor * quantization

    return {from, to}
}

const comparer = (a: ReturnType<ReturnType<typeof selector>>, b: ReturnType<ReturnType<typeof selector>>) => {
    return a.from.valueOf() === b.from.valueOf() && a.to.valueOf() === b.to.valueOf()
}

export const useVirtualScrollBounds = (base = 1.5, factor = 0.7) => {
    let memoizedSelector = useMemo(() => selector(base, factor), [base, factor])
    return useCanvasStore(memoizedSelector, comparer)
}