import React, {useMemo} from 'react'
import {OpUnitType} from 'dayjs'
import {useIntervals} from '../../hooks/timeIntervals'
import {useCanvasWidth, useTimePerPixel, useTimePerPixelAnchor, useTimeZero} from '../canvas/canvas'
import {IntervalToMs} from '../../units'

import '../canvas/canvas.css'
import "./header.css"
import {Defer} from "../../functions/Defer"

type DisplayInterval = {
    key: string,
    formatStart?: string,
    formatEnd?: string,
    amount: number,
    unit: OpUnitType,
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
        headerFormatStart: 'DD.MM.YY HH:mm:ss SSS',
    },
    {
        key: 'ms10',
        amount: 10,
        unit: 'millisecond',
        formatStart: 'SSS - ',
        formatEnd: 'SSS',
        headerFormatStart: 'DD.MM.YY HH:mm:ss SSS - ',
        headerFormatEnd: 'SSS',
        minWidth: 90,
    },
    {
        key: 'ms100',
        amount: 100,
        unit: 'millisecond',
        formatStart: 'SSS - ',
        formatEnd: 'SSS',
        headerFormatStart: 'DD.MM.YY HH:mm:ss SSS - ',
        headerFormatEnd: 'SSS',
        minWidth: 90,
    },
    {
        key: 's',
        amount: 1,
        unit: 'second',
        formatStart: 's"',
        headerFormatStart: 'DD.MM.YY HH:mm:ss',
    },
    {
        key: 's15',
        amount: 15,
        unit: 'second',
        formatStart: 's" - ',
        formatEnd: 's"',
        headerFormatStart: 'DD.MM.YY HH:mm:ss',
        minWidth: 75,
    },
    {
        key: 'm',
        amount: 1,
        unit: 'minute',
        formatStart: 'm\'',
        headerFormatStart: 'DD.MM.YY HH:mm',
    },
    {
        key: 'm15',
        amount: 15,
        unit: 'minutes',
        formatStart: 'm\' - ',
        formatEnd: 'm\'',
        headerFormatStart: 'DD.MM.YY HH:mm[ - ]',
        headerFormatEnd: 'HH:mm',
        minWidth: 70,
    },
    {
        key: 'h',
        amount: 1,
        unit: 'hour',
        formatStart: 'H[h]',
        headerFormatStart: 'DD.MM.YY H[h]',
    },
    {
        key: 'h4',
        amount: 4,
        unit: 'hours',
        formatStart: 'H[h] - ',
        formatEnd: 'H[h]',
        headerFormatStart: 'DD.MM.YY HH[h] - ',
        headerFormatEnd: 'HH[h]',
        minWidth: 80,
    },
    {
        key: 'd',
        amount: 1,
        unit: 'day',
        formatStart: 'D.',
        headerFormatStart: 'DD.MM.YY',
    },
    {
        key: 'w',
        amount: 1,
        unit: 'week',
        formatStart: '[KW ]W',
        headerFormatStart: '[KW] W YYYY',
        minWidth: 60,
    },
    {
        key: 'M',
        amount: 1,
        unit: 'month',
        formatStart: 'MMMM',
        headerFormatStart: 'MMMM YYYY',
        minWidth: 95,
    },
    {
        key: 'Q',
        amount: 3,
        unit: 'months',
        formatStart: '[Q]Q',
        headerFormatStart: '[Q]Q YYYY',
    },
    {
        key: 'y',
        amount: 1,
        unit: 'year',
        formatStart: 'YYYY',
        headerFormatStart: 'YYYY',
    },
    {
        key: 'y10',
        amount: 10,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        headerFormatStart: 'YYYY - ',
        headerFormatEnd: 'YYYY',
        minWidth: 120,
    },
    {
        key: 'y100',
        amount: 100,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        headerFormatStart: 'YYYY - ',
        headerFormatEnd: 'YYYY',
        minWidth: 120,
    },
    {
        key: 'y1000',
        amount: 1000,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        headerFormatStart: 'YYYY - ',
        headerFormatEnd: 'YYYY',
        minWidth: 120,
    },
    {
        key: 'y10000',
        amount: 10000,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        headerFormatStart: 'YYYY - ',
        headerFormatEnd: 'YYYY',
        minWidth: 120,
    },
    {
        key: 'y100000',
        amount: 100000,
        unit: 'years',
        formatStart: 'YYYY - ',
        formatEnd: 'YYYY',
        headerFormatStart: 'YYYY - ',
        headerFormatEnd: 'YYYY',
        minWidth: 120,
    },
]

export type IntervalHeaderProps = {
    amount: number,
    unit: OpUnitType,
    render?: boolean,
    display?: boolean
    formatStart?: string,
    formatEnd?: string,
}

export const IntervalHeader: React.FC<IntervalHeaderProps> = React.memo((
    {
        amount,
        unit,
        formatStart,
        formatEnd,
    }) => {
    const timeZero = useTimeZero()
    const timePerPixel = useTimePerPixelAnchor()
    const intervals = useIntervals(amount, unit, formatStart, formatEnd)

    return <g className={'timely'}>
        <Defer chunkSize={10}>
            {intervals?.map(([key, {start, end, label}]) => {
                return <g key={key}>
                    <rect
                        className={'non-scaling-stroke header-background'}
                        x={(start.valueOf() - timeZero) / timePerPixel}
                        width={(end.valueOf() - start.valueOf()) / timePerPixel}
                        y={0}
                        height={20}
                    />
                    <g className={'timely-dont-scale'}>
                        <text
                            x={((start + end) / 2 - timeZero) / timePerPixel}
                            textAnchor={'middle'}
                            y={15}
                            width={20}
                            style={{textTransform: 'capitalize'}}
                            fill={'white'}
                            className={"header"}
                            height={20}>
                            {label}
                        </text>
                    </g>
                </g>
            })}
        </Defer>
    </g>
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
                finer: interval.key === finer,
            }
        })
    }, [timePerPixel])

    let width = useCanvasWidth()

    return <>
        <rect x={-50} y={-50} width={width + 100} height={110} fill={"rgba(77,77,77,0.82)"}
              style={{filter: "drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.2))"}}/>
        {displayedUnits.filter(x => x.coarser || x.coarsest || x.coarse).map(x => {
            return <g
                key={x.key}
                style={{
                    opacity: x.coarse || x.coarsest ? 0 : 1,
                    transition: "0.1s"
                }}
            >
                <IntervalHeader
                    amount={x.amount}
                    unit={x.unit}
                    formatStart={x.headerFormatStart}
                    formatEnd={x.headerFormatEnd}/>
            </g>
        })}
        {displayedUnits.filter(x => x.render).map(x => {
            return <g
                key={x.key}
                opacity={x.coarser || x.finer ? 0 : 1}
                style={{
                    transform: x.coarse || x.coarser ? 'translateY(20px)' : x.fine || x.finer ? 'translateY(40px)' : undefined,
                    transition: "0.1s",
                    willChange: "transform, opacity"
                }}>
                <IntervalHeader
                    amount={x.amount}
                    unit={x.unit}
                    formatStart={x.formatStart}
                    formatEnd={x.formatEnd}/>
            </g>
        })}
    </>
})
Header.displayName = 'Header'