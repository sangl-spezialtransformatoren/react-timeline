import React, {useEffect, useState} from 'react'
import {isWeekend} from 'date-fns'
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
} from './headers'
import {format} from './functions'
import {createEventComponent, EventComponentType} from './event'
import {useTimePerPixel, useTimeZone} from "./store/hooks"

const DefaultMinuteHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let timeZone = useTimeZone()
    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel(format(new Date(date), 'm', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height}/>
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

    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel(format(new Date(date), 'm', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height}/>
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

    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel(format(new Date(date), 'H', {timeZone}))
    }, [date])


    return <>
        <rect x={x} y={y} width={width} height={height}/>
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

    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel(format(new Date(date), 'H', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height}/>
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
    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel(format(new Date(date), 'd', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height} fill={color}/>
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

    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel('KW ' + format(new Date(date), 'w', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height}/>
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

    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel(format(new Date(date), 'MMMM', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height}/>
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

    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel(format(new Date(date), 'QQQ', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height}/>
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

    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel(format(new Date(date), 'yyy', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height}/>
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

    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel(format(new Date(date), 'yy\'er\'', {timeZone}))
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height}/>
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

    let [label, setLabel] = useState("")
    useEffect(() => {
        setLabel(`${parseInt(format(new Date(date), 'yyyy', {timeZone}).substring(0, 2)) + 1}. Jhd.`)
    }, [date])

    return <>
        <rect x={x} y={y} width={width} height={height}/>
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
    let intervals = {
        'minute': {
            duration: 60 * 1000,
            component: MinuteHeader,
        },
        'quarter-hour': {
            duration: 15 * 60 * 1000,
            component: QuarterHourHeader,
        },
        'hour': {
            duration: 60 * 60 * 1000,
            component: HourHeader,
        },
        'four-hours': {
            duration: 4 * 60 * 60 * 1000,
            component: FourHourHeader,
        },
        'day': {
            duration: 24 * 60 * 60 * 1000,
            component: DayHeader,
        },
        'week': {
            duration: 7 * 24 * 60 * 60 * 1000,
            component: WeekHeader,
        },
        'month': {
            duration: 30 * 24 * 60 * 60 * 1000,
            component: MonthHeader,
        },
        'quarter': {
            duration: 91.25 * 24 * 60 * 60 * 1000,
            component: QuarterHeader,
        },
        'year': {
            duration: 365 * 24 * 60 * 60 * 1000,
            component: YearHeader,
        },
        'decade': {
            duration: 10 * 365 * 24 * 60 * 60 * 1000,
            component: DecadeHeader,
        },
        'century': {
            duration: 100 * 365 * 24 * 60 * 60 * 1000,
            component: CenturyHeader,
        },
    }
    let onlyMinWidths = Object.fromEntries(Object.entries(intervals).filter(([_, {duration}]) => {
        return duration / timePerPixel > minWidth
    }))

    let components = Object.entries(onlyMinWidths).sort(([_, {duration: duration1}], [__, {duration: duration2}]) => duration1 - duration2).map(([key, {component}]) => [key, component])
    let [[key1, Header1], [key2, Header2], [key3, Header3]] = components.slice(0, 3)

    return <>
        {Header3 &&
        <g>
            <Header3 key={key3 as string}/>
        </g>
        }
        {Header2 &&
        <g transform={'translate(0 20)'}>
            <Header2 key={key2 as string}/>
        </g>}
        {Header1 && <g transform={'translate(0 40)'}>
            <Header1 key={key1 as string}/>
        </g>
        }
    </>
}

export const DefaultEventComponent: EventComponentType = (
    {
        x,
        y,
        width,
        height,
        dragHandle,
        dragStartHandle,
        dragEndHandle,
    }) => {
    return <g style={{touchAction: "pan-y"}}>
        <rect ref={dragHandle} fill={'gray'} height={height} style={{paintOrder: 'stroke'}} y={y} x={x}
              width={width} filter="url(#dropshadow)"/>
        <rect ref={dragStartHandle} fill={'transparent'} y={y} height={height} x={x} width={10}
              style={{cursor: 'ew-resize'}}/>
        <rect ref={dragEndHandle} fill={'transparent'} y={y} height={height} x={x + width} width={10}
              style={{cursor: 'ew-resize'}}
              transform={'translate(-10, 0)'}/>
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'}>
                Test
            </div>
        </foreignObject>
    </g>
}

export const EventComponent = createEventComponent(DefaultEventComponent)