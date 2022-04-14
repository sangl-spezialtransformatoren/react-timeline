import {RpcProvider} from 'worker-rpc'
import dayjs, {Dayjs, OpUnitType} from 'dayjs'


import {internal} from 'collections/sorted-set'

import {
    createTimestampSet,
    getKeysAndTimestamps,
    Interval,
    limitTimestampSetLength,
    updateTimestamps,
} from '../functions/intervalFactory'
import {IntervalToMs} from '../units'
import 'dayjs/locale/de'

dayjs.locale('de')


const rpcProvider = new RpcProvider(
    (message) => postMessage(message),
)

onmessage = e => rpcProvider.dispatch(e.data)


let timestampSets: Record<string, internal.SortedSet<Interval>> = {}

rpcProvider.registerRpcHandler('createIntervals', (params: {from: number, to: number, n: number, interval: OpUnitType, formatStart?: string, formatEnd?: string} | undefined) => {
    if (params) {
        let {from, to, n, interval, formatStart, formatEnd} = params

        if ((to - from) / (n * IntervalToMs[interval]) < 500) {
            let key = JSON.stringify([n, interval, formatStart, formatEnd])

            let timestampSet = timestampSets?.[key]
            if (!timestampSet) {
                timestampSet = createTimestampSet()
                timestampSets[key] = timestampSet
            }


            from = dayjs(from).subtract(2 * n, interval).valueOf()
            to = dayjs(to).add(2 * n, interval).valueOf()

            let labelFactory = (start: Dayjs, end: Dayjs) => (formatStart ? start.format(formatStart) : '') + (formatEnd ? end.format(formatEnd) : '')
            updateTimestamps(timestampSet, from, to, n, interval, labelFactory)
            try {
                return getKeysAndTimestamps(timestampSet, from, to)
            } finally {
                updateTimestamps(timestampSet, from - 3 * (to - from), to + 3 * (to - from), n, interval, labelFactory)
                limitTimestampSetLength(timestampSet, from, to, 10000)
            }
        }
    }
})