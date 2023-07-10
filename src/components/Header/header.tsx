import React, {useMemo} from 'react'
import {ManipulateType, OpUnitType} from 'dayjs'

import './header.css'
import {createPortal} from 'react-dom'
import {animated, to} from '@react-spring/web'
import {round} from '../../functions/round'

import {IntervalToMs} from "../../functions/units"

type DisplayInterval = {
    key: string,
    formatStart?: string,
    formatEnd?: string,
    amount: number,
    unit: ManipulateType,
    headerFormatStart?: string,
    headerFormatEnd?: string,
    minWidth?: number
}

const MinWidth = 40
export const displayIntervals: DisplayInterval[] = [
    {
        key: 'ms',
        amount: 1,
        unit: 'millisecond',
        formatStart: 'SSS',
        headerFormatStart: 'DD.MM.YY HH:mm:ss SSS'
    },
    {
        key: 'ms10',
        amount: 10,
        unit: 'millisecond',
        formatStart: 'SSS - ',
        formatEnd: 'SSS',
        headerFormatStart: 'DD.MM.YY HH:mm:ss SSS - ',
        headerFormatEnd: 'SSS',
        minWidth: 90
    },
    {
        key: 'ms100',
        amount: 100,
        unit: 'millisecond',
        formatStart: 'SSS - ',
        formatEnd: 'SSS',
        headerFormatStart: 'DD.MM.YY HH:mm:ss SSS - ',
        headerFormatEnd: 'SSS',
        minWidth: 90
    },
    {
        key: 's',
        amount: 1,
        unit: 'second',
        formatStart: 's"',
        headerFormatStart: 'DD.MM.YY HH:mm:ss'
    },
    {
        key: 's15',
        amount: 15,
        unit: 'second',
        formatStart: 's" - ',
        formatEnd: 's"',
        headerFormatStart: 'DD.MM.YY HH:mm:ss',
        minWidth: 75
    },
    {
        key: 'm',
        amount: 1,
        unit: 'minute',
        formatStart: 'm\'',
        headerFormatStart: 'DD.MM.YY HH:mm'
    },
    {
        key: 'm15',
        amount: 15,
        unit: 'minutes',
        formatStart: 'm\' - ',
        formatEnd: 'm\'',
        headerFormatStart: 'DD.MM.YY HH:mm[ - ]',
        headerFormatEnd: 'HH:mm',
        minWidth: 70
    },
    {
        key: 'h',
        amount: 1,
        unit: 'hour',
        formatStart: 'H[h]',
        headerFormatStart: 'DD.MM.YY H[h]'
    },
    {
        key: 'h4',
        amount: 4,
        unit: 'hours',
        formatStart: 'H[h] - ',
        formatEnd: 'H[h]',
        headerFormatStart: 'DD.MM.YY HH[h] - ',
        headerFormatEnd: 'HH[h]',
        minWidth: 80
    },
    {
        key: 'd',
        amount: 1,
        unit: 'day',
        formatStart: 'D.',
        headerFormatStart: 'DD.MM.YY'
    },
    {
        key: 'w',
        amount: 1,
        unit: 'week',
        formatStart: '[KW ]W',
        headerFormatStart: '[KW] W YYYY',
        minWidth: 60
    },
    {
        key: 'M',
        amount: 1,
        unit: 'month',
        formatStart: 'MMMM',
        headerFormatStart: 'MMMM YYYY',
        minWidth: 95
    },
    {
        key: 'Q',
        amount: 3,
        unit: 'months',
        formatStart: '[Q]Q',
        headerFormatStart: '[Q]Q YYYY'
    },
    {
        key: 'y',
        amount: 1,
        unit: 'year',
        formatStart: 'YYYY',
        headerFormatStart: 'YYYY'
    },
    {
        key: 'y10',
        amount: 10,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        headerFormatStart: 'YYYY - ',
        headerFormatEnd: 'YYYY',
        minWidth: 120
    },
    {
        key: 'y100',
        amount: 100,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        headerFormatStart: 'YYYY - ',
        headerFormatEnd: 'YYYY',
        minWidth: 120
    },
    {
        key: 'y1000',
        amount: 1000,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        headerFormatStart: 'YYYY - ',
        headerFormatEnd: 'YYYY',
        minWidth: 120
    },
    {
        key: 'y10000',
        amount: 10000,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        headerFormatStart: 'YYYY - ',
        headerFormatEnd: 'YYYY',
        minWidth: 120
    },
    {
        key: 'y100000',
        amount: 100000,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        headerFormatStart: 'YYYY - ',
        headerFormatEnd: 'YYYY',
        minWidth: 120
    }
]

export type IntervalHeaderProps = {
    amount: number,
    unit: OpUnitType,
    render?: boolean,
    display?: boolean
    formatStart?: string,
    formatEnd?: string,
    y?: number
    visible?: boolean
}

let width = 100

export const IntervalHeader: React.FC<IntervalHeaderProps> = React.memo((
    {
        amount,
        unit,
        formatStart,
        formatEnd,
        y = 0,
        visible = true

    }) => {
    const intervals = useIntervals(amount, unit, formatStart, formatEnd)
    let timeZero = useTimeZero()
    let timePerPixelAnchor = useTimePerPixelAnchor()
    let {from, to} = useVirtualScrollBounds()

    return <>{
        intervals?.map(([key, {start, end, label}]) => {
            return <span key={key} style={{
                position: 'absolute',
                transform: `translateX(calc(var(--time-scale) * ${round(((start + end) / 2 - timeZero) / (10 * timePerPixelAnchor))}px))`,
                left: 0,
                top: y,
                width: width,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s',
                textAlign: 'center',
                display: (start + end) / 2 > from && (start + end) / 2 < to ? 'initial' : 'none'
            }}>
                {label}
            </span>
        })
    }</>
})

IntervalHeader.displayName = 'IntervalHeader'


export const Header = React.memo(() => {
    const timePerPixel = useTimePerPixel()

    let displayedUnits = useMemo(() => {
        let fineInterval = displayIntervals.filter((interval) => {
            let width = interval.amount * IntervalToMs[interval.unit] / timePerPixel
            return width > (interval?.minWidth || MinWidth)
        })?.[0]

        let indexOfFineInterval = displayIntervals.indexOf(fineInterval)
        let coarsest = displayIntervals?.[indexOfFineInterval + 3].key
        let coarser = displayIntervals?.[indexOfFineInterval + 2].key
        let coarse = displayIntervals?.[indexOfFineInterval + 1].key
        let fine = displayIntervals?.[indexOfFineInterval].key
        let finer = displayIntervals?.[indexOfFineInterval - 1].key

        return displayIntervals.map(interval => {
            return {
                ...interval,
                display: [coarse, fine].includes(interval.key),
                render: [coarser, coarse, fine, finer].includes(interval.key),
                coarsest: interval.key === coarsest,
                coarser: interval.key == coarser,
                coarse: interval.key === coarse,
                fine: interval.key === fine,
                finer: interval.key === finer
            }
        })
    }, [timePerPixel])

    let timeZero = useTimeZero()
    let timePerPixelAnchor = useTimePerPixelAnchor()
    let timePerPixelSpring = useTimePerPixel()
    let timeStartSpring = useTimeStart()
    let transform = to([timeStartSpring, timePerPixelSpring], (timeStart, timePerPixel) => {
        let timeOffset = (timeZero - timeStart) / timePerPixel
        return `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ${timeOffset - width / 2}, 0, 0, 1)`
    })

    let timeScale = to([timeStartSpring, timePerPixelSpring], (timeStart, timePerPixel) => {
        return round(10 * timePerPixelAnchor / timePerPixel, 1000)
    })

    let containerRef = {current: undefined}
    return containerRef?.current ? createPortal(<>
        <div style={{
            width: '100%',
            height: 60,
            top: 0,
            left: 0,
            background: 'rgba(77,77,77,0.82)',
            filter: 'drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.2))',
            position: 'absolute'
        }}/>
        <animated.div style={{
            transform: transform,
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            '--time-scale': timeScale
        }}>
            {displayedUnits.filter(x => x.coarser || x.coarsest || x.coarse).map(x => {
                return <IntervalHeader
                    key={x.key}
                    visible={!(x.coarse || x.coarsest)}
                    amount={x.amount}
                    unit={x.unit}
                    formatStart={x.headerFormatStart}
                    formatEnd={x.headerFormatEnd}/>
            })}
            {displayedUnits.filter(x => x.render).map(x => {
                return <IntervalHeader
                    y={x.coarse || x.coarser ? 20 : x.fine || x.finer ? 40 : 0}
                    visible={!(x.coarser || x.finer)}
                    key={x.key}
                    amount={x.amount}
                    unit={x.unit}
                    formatStart={x.formatStart}
                    formatEnd={x.formatEnd}/>
            })}
        </animated.div>
    </>, containerRef.current) : <></>
})
Header.displayName = 'Header'