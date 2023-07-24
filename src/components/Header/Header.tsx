import React, {useRef} from 'react'
import {ManipulateType} from 'dayjs'
import {useIntervals} from '../../hooks/timeIntervals'
import {useCanvasStore, useTimePerPixel, useTimeStart} from '../Canvas/store'
import {IntervalToMs} from '../../functions/units'
import {Interval} from '../../functions/intervalFactory'
import {animated, to} from '@react-spring/web'
import {createPortal} from 'react-dom'
import {round} from '../../functions/round'
import './header.css'


// Specifies how the headers are displayed
// For example:
type HeaderUnit = {
    key: string
    amount: number
    unit: ManipulateType
    // Format strings if the unit is the outermost
    headerFormatStart?: string
    headerFormatEnd?: string
    // Default format strings
    formatStart?: string
    formatEnd?: string
    // Minimum width for the unit to be displayed:
    minWidth: number

}
export const DefaultHeaderUnits: HeaderUnit[] = [
    {
        key: '10000y',
        amount: 10000,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        minWidth: 120
    },
    {
        key: '1000y',
        amount: 1000,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        minWidth: 120
    },
    {
        key: '100y',
        amount: 100,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        minWidth: 120
    },
    {
        key: '10y',
        amount: 10,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        minWidth: 120
    },
    {
        key: '1y',
        amount: 1,
        unit: 'year',
        formatStart: 'YYYY',
        headerFormatStart: 'YYYY',
        minWidth: 100
    },
    {
        key: '3M',
        amount: 3,
        unit: 'months',
        formatStart: '[Q]Q',
        headerFormatStart: '[Q]Q YYYY',
        minWidth: 100
    },
    {
        key: '1M',
        amount: 1,
        unit: 'month',
        formatStart: 'MMMM',
        headerFormatStart: 'MMMM YYYY',
        minWidth: 120
    },
    {
        key: '1W',
        amount: 1,
        unit: 'week',
        formatStart: '[KW ]W',
        headerFormatStart: '[KW] W YYYY',
        minWidth: 100
    },
    {
        key: '1D',
        amount: 1,
        unit: 'day',
        formatStart: 'D.',
        headerFormatStart: 'DD.MM.YY',
        minWidth: 45
    },
    {
        key: '4h',
        amount: 4,
        unit: 'hours',
        formatStart: 'H[h] - ',
        formatEnd: 'H[h]',
        headerFormatStart: 'DD.MM.YY H[h] - ',
        headerFormatEnd: 'H[h]',
        minWidth: 120
    },
    {
        key: '1h',
        amount: 1,
        unit: 'hour',
        formatStart: 'H[h]',
        headerFormatStart: 'DD.MM.YY H[h]',
        minWidth: 100
    },
    {
        key: '15m',
        amount: 15,
        unit: 'minutes',
        formatStart: "m\\' - ",
        formatEnd: "m\\'",
        headerFormatStart: 'DD.MM.YY HH:mm[ - ]',
        headerFormatEnd: 'HH:mm',
        minWidth: 140
    },
    {
        key: '1m',
        amount: 1,
        unit: 'minute',
        formatStart: "m\\'",
        headerFormatStart: 'DD.MM.YY HH:mm',
        minWidth: 60
    },
    {
        key: '15s',
        amount: 15,
        unit: 'second',
        formatStart: 's\\" - ',
        formatEnd: 's\\"',
        headerFormatStart: 'DD.MM.YY HH:mm:ss',
        minWidth: 80
    },
    {
        key: '1s',
        amount: 1,
        unit: 'second',
        formatStart: `s\\"`,
        headerFormatStart: 'DD.MM.YY HH:mm:ss',
        minWidth: 60
    },
    {
        key: '100ms',
        amount: 100,
        unit: 'millisecond',
        formatStart: 'SSS - ',
        formatEnd: 'SSS',
        headerFormatStart: 'DD.MM.YY HH:mm:ss SSS - ',
        headerFormatEnd: 'SSS',
        minWidth: 90
    },
    {
        key: '10ms',
        amount: 10,
        unit: 'millisecond',
        formatStart: 'SSS - ',
        formatEnd: 'SSS',
        headerFormatStart: 'DD.MM.YY HH:mm:ss SSS - ',
        headerFormatEnd: 'SSS',
        minWidth: 90
    },
    {
        key: '1ms',
        amount: 1,
        unit: 'millisecond',
        formatStart: 'SSS',
        headerFormatStart: 'DD.MM.YY HH:mm:ss SSS',
        minWidth: 100
    }
]


export const Header: React.FC<{units?: HeaderUnit[]}> = ({units = DefaultHeaderUnits}) => {
    let header = useCanvasStore(state => state.header)
    let timeStart = useTimeStart()
    let timePerPixel = useTimePerPixel()
    let intervals = useRef<(Interval & {row: number})[]>([])


    let size = 200
    let elements = useRef<(HTMLDivElement | null)[]>([...new Array(size)])

    useIntervals(() => ({
        units: () => {
            let timePerPixelGoal = timePerPixel.get()
            let threeSmallestUnits = units.filter(({amount, unit, minWidth}) => {
                let width = amount * IntervalToMs[unit] / timePerPixelGoal
                return width > minWidth
            }).slice(-3)
            let headerUnit = threeSmallestUnits[0]
            let middleUnit = threeSmallestUnits[1]
            let bottomUnit = threeSmallestUnits[2]

            return [
                {...headerUnit, formatStart: headerUnit.headerFormatStart, formatEnd: headerUnit.headerFormatEnd},
                middleUnit,
                bottomUnit
            ]
        },
        callback: (intervalSets) => {
            intervals.current = intervalSets
            .map((group, row) => {
                return Object.values(group.intervals).map(interval => ({...interval, row}))
            })
            .reduce<(Interval & {row: number})[]>(
                (acc, current) => [...acc, ...current],
                []
            )
            console.log("Header", intervals.current.length)
            timePerPixel.advance(1)
            timeStart.advance(1)
        }
    }), [timePerPixel, timeStart, units])


    return header ? createPortal(<>
        <div style={{
            position: "absolute",
            width: "calc(100% + 20px)",
            height: 72,
            left: -10,
            top: -10,
            boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.4)",
            background: 'rgba(240, 240, 240, 0.82)',
        }}/>
        {elements.current.map((_, i) => {
            return <React.Fragment key={i}>

                <animated.div
                    ref={x => elements.current[i] = x}
                    className={'header'}
                    style={{
                        display: to([timeStart, timePerPixel], () => intervals.current?.[i] !== undefined && intervals.current[i].row <= 2 ? 'inline-block' : 'none'),
                        left: to([timeStart, timePerPixel], (timeStart, timePerPixel) => intervals.current?.[i] ? round((intervals.current[i].start - timeStart) / timePerPixel) : 0),
                        top: to([timeStart, timePerPixel], () => intervals.current?.[i] ? round(intervals.current[i].row * 20) : 0),
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        '--content': to([timeStart, timePerPixel], () => '"' + intervals.current?.[i]?.label + '"'),
                        width: to([timeStart, timePerPixel], (_, timePerPixel) => intervals.current?.[i] ? round((intervals.current[i].end - intervals.current[i].start) / timePerPixel) : 0),
                    }}
                />
            </React.Fragment>
        })}
    </>, header) : <></>
}