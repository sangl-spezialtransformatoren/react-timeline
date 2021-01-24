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
} from '../headers'
import {useTimePerPixel, useTimeZone} from '../store/hooks'
import {isWeekend} from 'date-fns'
import React, {useContext, useEffect, useState} from 'react'
import {format} from '../functions'
import {DragOffset} from '../timeline'
import {GroupsContext} from '../canvas'
import {createPortal} from 'react-dom'

const DefaultMinuteHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()
    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel(format(new Date(date), 'm', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const MinuteHeader = createMinuteHeader(DefaultMinuteHeader)
const DefaultQuarterHourHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()

    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel(format(new Date(date), 'm', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const QuarterHourHeader = createQuarterHourHeader(DefaultQuarterHourHeader)
const DefaultHourHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()

    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel(format(new Date(date), 'H', {timeZone}))
    }, [date])


    return <>
        <rect x={x} y={y} width={width} height={height} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const HourHeader = createHourHeader(DefaultHourHeader)
const DefaultFourHourHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()

    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel(format(new Date(date), 'H', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const FourHourHeader = createFourHourHeader(DefaultFourHourHeader)
const DefaultDayHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()
    let color = isWeekend(date) ? 'black' : 'gray'
    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel(format(new Date(date), 'd', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} fill={color} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const DayHeader = createDayHeader(DefaultDayHeader)
const DefaultWeekHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()

    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel('KW ' + format(new Date(date), 'w', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const WeekHeader = createWeekHeader(DefaultWeekHeader)
const DefaultMonthHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()

    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel(format(new Date(date), 'MMMM', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const MonthHeader = createMonthHeader(DefaultMonthHeader)
const DefaultQuarterHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()

    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel(format(new Date(date), 'QQQ', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const QuarterHeader = createQuarterHeader(DefaultQuarterHeader)
const DefaultYearHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()

    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel(format(new Date(date), 'yyy', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const YearHeader = createYearHeader(DefaultYearHeader)
const DefaultDecadeHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()

    let [label, setLabel] = useState('')
    useEffect(() => {
        setLabel(format(new Date(date), 'yy\'er\'', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const DecadeHeader = createDecadeHeader(DefaultDecadeHeader)

const DefaultCenturyHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()

    let [label, setLabel] = useState('')
    useEffect(() => {
        let year = format(new Date(date), 'yyyy', {timeZone})
        let yearInt = parseInt(year.substr(0, 2)) + 1
        let label = `${yearInt}. Jhd.`
        setLabel(label)
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} />
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: 'center'}}>
                {label}
            </div>
        </foreignObject>
    </>
}
export const CenturyHeader = createCenturyHeader(DefaultCenturyHeader)
export const AutomaticHeader: React.FC = () => {
    let timePerPixel = useTimePerPixel()
    let minWidth = 30

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

    let {header} = useContext(GroupsContext)

    return header.current ? createPortal(<DragOffset>
        {intervals.map(({name, component: Component}, index) => {
            return render[index] &&
              <g key={name} transform={`translate(0 ${60 - 20 * positions[index + 1]})`}
                 visibility={show[index] ? 'show' : 'hidden'}>
                <Component />
              </g>
        })}
    </DragOffset>, header.current) : null
}