import {
    createCenturyHeader,
    createDayHeader,
    createDecadeHeader,
    createFourHourHeader,
    createHourHeader,
    createMinuteHeader,
    createMonthHeader,
    createQuarterHeader,
    createQuarterHourHeader,
    createWeekHeader,
    createYearHeader,
    TemporalHeaderComponent,
} from '../components/header'
import {useSize, useTimePerPixel, useTimeZone} from '../store/hooks'
import {isWeekend} from 'date-fns'
import React, {useEffect, useMemo, useState} from 'react'
import {format} from '../functions/misc'
import {AsHeader} from '../context/canvasContext'
import {DragOffset} from '../components/canvas'

let headerColor = 'rgba(250, 250, 250, 1)'

function createLabelTemporalHeader(mapDateToLabel: (date: Date | number, optionalData: {
    timeZone: string,
    width: number,
    height: number
}) => string): TemporalHeaderComponent {
    return ({x, y, width, height, date}) => {
        let timeZone = useTimeZone()
        let label = useMemo(() => {
            return mapDateToLabel(date, {timeZone, width, height})
        }, [date, width, height])

        return <>
            <rect x={x} y={y} width={width} height={height} fill={headerColor} stroke={headerColor} />
            <text x={x + width / 2} y={y + height / 2} alignmentBaseline={'central'} textAnchor={'middle'}
                  fontFamily={'sans-serif'} textRendering={"optimizeSpeed"}>{label}</text>
        </>
    }
}

const DefaultMinuteHeader: TemporalHeaderComponent = createLabelTemporalHeader((date, {timeZone}) => format(new Date(date), 'm', {timeZone}))
export const MinuteHeader = createMinuteHeader(DefaultMinuteHeader)

const DefaultQuarterHourHeader: TemporalHeaderComponent = createLabelTemporalHeader((date, {timeZone}) => format(new Date(date), 'm', {timeZone}))
export const QuarterHourHeader = createQuarterHourHeader(DefaultQuarterHourHeader)


const DefaultHourHeader: TemporalHeaderComponent = createLabelTemporalHeader((date, {timeZone}) => format(new Date(date), 'H', {timeZone}))
export const HourHeader = createHourHeader(DefaultHourHeader)


const DefaultFourHourHeader: TemporalHeaderComponent = createLabelTemporalHeader((date, {timeZone}) => format(new Date(date), 'H', {timeZone}))
export const FourHourHeader = createFourHourHeader(DefaultFourHourHeader)

const DefaultDayHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()
    let color = isWeekend(date) ? 'gray' : 'black'
    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel(format(new Date(date), 'd', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} fill={headerColor} />
        <text x={x + width / 2} y={y + height - 8} textAnchor={'middle'} fill={color}
              fontFamily={'sans-serif'} textRendering={"optimizeSpeed"}>{label}</text>
    </>
}
export const DayHeader = createDayHeader(DefaultDayHeader)

const DefaultWeekHeader = createLabelTemporalHeader((date, {
    timeZone,
    width,
}) => width > 50 ? 'KW ' + format(new Date(date), 'I', {timeZone}) : format(new Date(date), 'I', {timeZone}))
export const WeekHeader = createWeekHeader(DefaultWeekHeader)

const DefaultMonthHeader = createLabelTemporalHeader((date, {
    timeZone,
    width,
}) => width > 100 ? format(new Date(date), 'MMMM', {timeZone}) : format(new Date(date), 'MMM', {timeZone}))
export const MonthHeader = createMonthHeader(DefaultMonthHeader)

const DefaultQuarterHeader = createLabelTemporalHeader((date, {timeZone}) => format(new Date(date), 'QQQ', {timeZone}))
export const QuarterHeader = createQuarterHeader(DefaultQuarterHeader)

const DefaultYearHeader = createLabelTemporalHeader((date, {timeZone}) => format(new Date(date), 'yyy', {timeZone}))
export const YearHeader = createYearHeader(DefaultYearHeader)

const DefaultDecadeHeader = createLabelTemporalHeader((date, {timeZone}) => format(new Date(date), 'yy\'er\'', {timeZone}))
export const DecadeHeader = createDecadeHeader(DefaultDecadeHeader)

const DefaultCenturyHeader = createLabelTemporalHeader((date, {timeZone}) => {
    let year = format(new Date(date), 'yyyy', {timeZone})
    let yearInt = parseInt(year.substr(0, 2)) + 1
    return `${yearInt}. Jhd.`
})
export const CenturyHeader = createCenturyHeader(DefaultCenturyHeader)

export const AutomaticHeader: React.FC = () => {
    let timePerPixel = useTimePerPixel()
    let minWidth = 30
    let {width} = useSize()

    let intervals: {name: string, duration: number, component: React.FC}[] = [
        {
            name: 'minute',
            duration: 60 * 1000,
            component: MinuteHeader,
        },
        {
            name: 'quarter-hour',
            duration: 15 * 60 * 1000,
            component: QuarterHourHeader,
        },
        {
            name: 'hour',
            duration: 60 * 60 * 1000,
            component: HourHeader,
        },
        {
            name: 'four-hours',
            duration: 4 * 60 * 60 * 1000,
            component: FourHourHeader,
        },
        {
            name: 'day',
            duration: 24 * 60 * 60 * 1000,
            component: DayHeader,
        },
        {
            name: 'week',
            duration: 7 * 24 * 60 * 60 * 1000,
            component: WeekHeader,
        },
        {
            name: 'month',
            duration: 30 * 24 * 60 * 60 * 1000,
            component: MonthHeader,
        },
        {
            name: 'quarter',
            duration: 91.25 * 24 * 60 * 60 * 1000,
            component: QuarterHeader,
        },
        {
            name: 'year',
            duration: 365 * 24 * 60 * 60 * 1000,
            component: YearHeader,
        },
        {
            name: 'decade',
            duration: 10 * 365 * 24 * 60 * 60 * 1000,
            component: DecadeHeader,
        },
        {
            name: 'century',
            duration: 100 * 365 * 24 * 60 * 60 * 1000,
            component: CenturyHeader,
        },
    ]

    // Returns [false, false, true, true]
    let biggerThanMinWidth = intervals.map(interval => {
        return interval.duration / timePerPixel > minWidth
    })

    let show = biggerThanMinWidth.map((value, index) => value && (biggerThanMinWidth?.[index - 3] === false || biggerThanMinWidth?.[index - 3] === undefined))
    let render = show.map((value, index) => value || !!show?.[index - 1])
    let positions = show.map((_, index) => show.slice(0, index).filter(x => x).length)
    return <AsHeader>
        <DragOffset>
            {intervals.map(({name, component: Component}, index) => {
                return render[index] &&
                  <g key={name} style={{transform: `translate3d(0, ${75 - 25 * positions[index + 1]}px, 0)`}}
                     visibility={show[index] ? 'show' : 'hidden'}>
                    <Component />
                  </g>
            })}
        </DragOffset>
        <rect x={0} y={75} width={width} height={1} fill={'lightgray'} />
    </AsHeader>
}