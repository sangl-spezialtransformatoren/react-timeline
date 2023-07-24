import {ManipulateType, OpUnitType} from 'dayjs'
import {DependencyList, useCallback, useMemo, useRef} from 'react'
import {RpcProvider} from 'worker-rpc'
import {Interval} from '../functions/intervalFactory'
import {useCanvasWidth, useTimePerPixel, useTimeStart} from '../components/Canvas/store'
import {useAnimationFrame} from './animationFrame'

function isPromise(p: unknown) {
    return p && Object.prototype.toString.call(p) === '[object Promise]'
}

let workerSingleton: Worker | undefined = undefined
let rpcProviderSingleton: RpcProvider | undefined = undefined

const workerPath = 'createIntervals.js'

export type TimeUnit = {
    key: string,
    amount: number
    unit: ManipulateType
    formatStart?: string
    formatEnd?: string
}


export const useIntervalCalculator = () => {
    if (!workerSingleton) {
        workerSingleton = new Worker(workerPath)
    }
    let worker = workerSingleton

    if (!rpcProviderSingleton) {
        rpcProviderSingleton = new RpcProvider(
            (message) => worker.postMessage(message)
        )
        worker.onmessage = (e: unknown & {data: object}) => rpcProvider.dispatch(e.data)
    }
    let rpcProvider = rpcProviderSingleton

    let createIntervals = useCallback(async (from: number, to: number, n: number, interval: OpUnitType, formatStart = '', formatEnd = '') => {
        if (rpcProvider) {
            let rpcResult: [string, Interval][] = await rpcProvider.rpc(
                'createIntervals',
                {
                    from: from.valueOf(),
                    to: to.valueOf(),
                    n,
                    interval,
                    formatStart,
                    formatEnd
                }
            )
            if (!rpcResult) {
                throw new Error('Error in calculating intervals.')
            }
            return Object.fromEntries(rpcResult) as Record<string, Interval>
        } else {
            return {} as Record<string, Interval>
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
const factor = 0.3

export type IntervalCallbackOptions = {
    units: () => TimeUnit[]
    callback: (result: {key: string, intervals: Record<string, Interval>}[]) => unknown | Promise<unknown>
}

export const useIntervals = (config: () => IntervalCallbackOptions, deps: DependencyList) => {
    let {callback, units} = useMemo(config, [config, ...deps])

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
        let canvasWidth = canvasWidthSpring.get()

        let timeEnd = timeStart + timePerPixel * canvasWidth
        let timeWidth = timeEnd - timeStart

        const quantization = logRound(timeWidth, base)
        const roundedTimeStart = roundTo(timeStart, quantization)
        const roundedTimeEnd = roundTo(timeEnd, quantization)

        let newFrom = roundedTimeStart - factor * quantization
        let newTo = roundedTimeEnd + factor * quantization

        // Update intervals and execute the callback if the range changed
        if (timeFrom.current !== newFrom || timeTo.current !== newTo) {
            timeFrom.current = newFrom
            timeTo.current = newTo

            let unitsToCalculate = units()
            let lowerBound = newFrom - (newTo - newFrom)
            let upperBound = newTo + (newTo - newFrom)
            try {
                let results: {key: string, intervals: Record<string, Interval>}[] = await Promise.all(
                    unitsToCalculate.map(
                        async ({key, amount, unit, formatStart, formatEnd}) => {
                            let result = await createIntervals(lowerBound, upperBound, amount, unit, formatStart, formatEnd)
                            return {key, intervals: result}
                        }
                    )
                )

                if (isPromise(callback)) {
                    await callback(results)
                } else {
                    callback(results)
                }
            } catch {
                // Do nothing
            }
        }
    })
    return intervals.current
}