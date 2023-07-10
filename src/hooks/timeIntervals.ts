import {OpUnitType} from 'dayjs'
import {useCallback} from 'react'
import {RpcProvider} from 'worker-rpc'
import {Interval} from '../functions/intervalFactory'

let workerSingleton: Worker | undefined = undefined
let rpcProviderSingleton: RpcProvider | undefined = undefined

const workerPath = 'createIntervals.js'

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
