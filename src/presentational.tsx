import React from "react"
import {
    createDayHeader,
    createHourHeader,
    createMinuteHeader,
    createMonthHeader,
    createQuarterHourHeader,
    createWeekHeader,
    TemporalHeaderComponent
} from "./headers"
import {format, isWeekend} from "date-fns"
import {de} from 'date-fns/locale'

const DefaultMinuteHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    return <>
        <rect x={x} y={y} width={width} height={height}/>
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: "center"}}>
                {format(new Date(date), "m", {locale: de})}
            </div>
        </foreignObject>
    </>
}

export const MinuteHeader = createMinuteHeader(DefaultMinuteHeader)

const DefaultQuarterHourHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    return <>
        <rect x={x} y={y} width={width} height={height}/>
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: "center"}}>
                {format(new Date(date), "m", {locale: de})}
            </div>
        </foreignObject>
    </>
}

export const QuarterHourHeader = createQuarterHourHeader(DefaultQuarterHourHeader)

const DefaultHourHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    return <>
        <rect x={x} y={y} width={width} height={height}/>
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: "center"}}>
                {format(new Date(date), "H", {locale: de})}
            </div>
        </foreignObject>
    </>
}

export const HourHeader = createHourHeader(DefaultHourHeader)

const DefaultDayHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    let color = isWeekend(date) ? "black" : "gray"
    return <>
        <rect x={x} y={y} width={width} height={height} fill={color}/>
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: "center"}}>
                {format(new Date(date), "d", {locale: de})}
            </div>
        </foreignObject>
    </>
}

export const DayHeader = createDayHeader(DefaultDayHeader)

const DefaultWeekHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    return <>
        <rect x={x} y={y} width={width} height={height}/>
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: "center"}}>
                {format(new Date(date), "w", {locale: de})}
            </div>
        </foreignObject>
    </>
}

export const WeekHeader = createWeekHeader(DefaultWeekHeader)

const DefaultMonthHeader: TemporalHeaderComponent = ({x, y, width, height, date}) => {
    return <>
        <rect x={x} y={y} width={width} height={height}/>
        <foreignObject y={y} height={height} x={x} width={width} style={{pointerEvents: 'none'}}>
            <div className={'react-timeline-event'} style={{textAlign: "center"}}>
                {format(new Date(date), "MMMM", {locale: de})}
            </div>
        </foreignObject>
    </>
}

export const MonthHeader = createMonthHeader(DefaultMonthHeader)