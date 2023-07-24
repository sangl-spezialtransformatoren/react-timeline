import {ManipulateType, OpUnitType} from 'dayjs'
import {useCallback, useRef} from 'react'
import {RpcProvider} from 'worker-rpc'
import {Interval} from '../functions/intervalFactory'
import {useCanvasWidth, useTimePerPixel, useTimeStart} from "../components/Canvas/store"
import {useAnimationFrame} from "./animationFrame"
import {IntervalToMs} from "../functions/units"

let workerSingleton: Worker | undefined = undefined
let rpcProviderSingleton: RpcProvider | undefined = undefined

const workerPath = 'createIntervals.js'
export const defaultUnits: [number, ManipulateType][] = [
    [100, 'years'],
    [10, 'years'],
    [1, 'year'],
    [3, 'months'],
    [1, 'month'],
    [1, 'week'],
    [1, 'day'],
    [4, 'hours'],
    [1, 'hour'],
    [15, 'minutes'],
    [1, 'minute'],
    [15, 'seconds'],
    [1, 'second'],
    [100, 'milliseconds'],
    [10, 'milliseconds'],
    [1, 'milliseconds']
]
export const useIntervalCalculator = () => {
    if (!workerSingleton) {
        workerSingleton = new Worker(workerPath)
    }
    let worker = workerSingleton

    if (!rpcProviderSingleton) {
        rpcProviderSingleton = new RpcProvider(
            (message) => worker.postMessage(message),
        )
        worker.onmessage = (e: unknown & {data: object}) => rpcProvider.dispatch(e.data)
    }
    let rpcProvider = rpcProviderSingleton

    let createIntervals = useCallback(async (from: number, to: number, n: number, interval: OpUnitType, formatStart = '', formatEnd = '') => {
        if (rpcProvider) {
            return await rpcProvider.rpc(
                'createIntervals',
                {
                    from: from.valueOf(),
                    to: to.valueOf(),
                    n,
                    interval,
                    formatStart,
                    formatEnd,
                },
            ) as [number, Interval][]
        } else {
            return [] as [number, Interval][]
        }
    }, [rpcProvider])

    return {rpcProvider, createIntervals}
}

function logRound(value: number, base = 2) {
    return base ** (Math.round(Math.log(value) / Math.log(base)))
}

function roundTo(value: number, size: number) {
    return size * Math.round(value / size)
}

const base = 1.1
const factor = 0.1

export const useIntervalCallback = (onChange: (_intervals: [number, Interval][][]) => unknown, units = defaultUnits, minWidth = 30) => {
    let {createIntervals} = useIntervalCalculator()
    let timeStartSpring = useTimeStart()
    let timePerPixelSpring = useTimePerPixel()
    let canvasWidthSpring = useCanvasWidth()

    let timeFrom = useRef(0)
    let timeTo = useRef(0)

    let intervals = useRef<[number, Interval][][]>([])
    useAnimationFrame(async () => {
        let timeStart = timeStartSpring.get()
        let timePerPixel = timePerPixelSpring.get()
        let timePerPixelGoal = timePerPixelSpring.goal
        let canvasWidth = canvasWidthSpring.get()

        let timeEnd = timeStart + timePerPixel * canvasWidth
        let timeWidth = timeEnd - timeStart

        const quantization = logRound(timeWidth, base)
        const roundedTimeStart = roundTo(timeStart, quantization)
        const roundedTimeEnd = roundTo(timeEnd, quantization)

        let newFrom = roundedTimeStart - factor * quantization
        let newTo = roundedTimeEnd + factor * quantization

        if (timeFrom.current !== newFrom || timeTo.current !== newTo) {
            timeFrom.current = newFrom
            timeTo.current = newTo

            let unitsToCalculate = units.filter(([amount, unit]) => amount * IntervalToMs[unit] / timePerPixelGoal > minWidth)
            let lowerBound = newFrom - (newTo - newFrom)
            let upperBound = newTo + (newTo - newFrom)
            let results = await Promise.all(unitsToCalculate.map(async ([amount, unit]) => await createIntervals(lowerBound, upperBound, amount, unit)))
            onChange(results.filter(x => !!x))
        }
    })
    return intervals.current
}