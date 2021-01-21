import {
    createCenturyGrid,
    createDayGrid,
    createDecadeGrid,
    createFourHourGrid,
    createHourGrid,
    createMinuteGrid,
    createMonthGrid,
    createQuarterGrid,
    createQuarterHourGrid,
    createWeekGrid,
    createYearGrid,
    TemporalGridComponent
} from "../grid"
import {useSize, useTimePerPixel} from "../store/hooks"
import React, {useEffect, useState} from "react"
import {isWeekend} from "date-fns"

const DefaultGrid: TemporalGridComponent = ({x}) => {
    let {height} = useSize()
    return <>
        <rect x={x} y={0} width={1} height={height} fill={"rgba(0,0,0,0.1)"}/>
    </>
}
export const MinuteGrid = createMinuteGrid(DefaultGrid)
export const QuarterHourGrid = createQuarterHourGrid(DefaultGrid)
export const HourGrid = createHourGrid(DefaultGrid)
export const FourHourGrid = createFourHourGrid(DefaultGrid)
const DefaultDayGrid: TemporalGridComponent = ({x, date, width}) => {
    let {height} = useSize()
    let [weekend, setWeekend] = useState(false)
    useEffect(() => {
        setWeekend(isWeekend(date))
    }, [date])
    return <>
        <rect x={x} y={0} width={weekend ? width : 1} height={height} fill={"rgba(0,0,0,0.1)"}/>
    </>
}
export const DayGrid = createDayGrid(DefaultDayGrid)
export const WeekGrid = createWeekGrid(DefaultGrid)
export const MonthGrid = createMonthGrid(DefaultGrid)
export const QuarterGrid = createQuarterGrid(DefaultGrid)
export const YearGrid = createYearGrid(DefaultGrid)
export const DecadeGrid = createDecadeGrid(DefaultGrid)
export const CenturyGrid = createCenturyGrid(DefaultGrid)
export const AutomaticGrid: React.FC = () => {
    let timePerPixel = useTimePerPixel()
    let minWidth = 18
    let intervals = {
        'minute': {
            duration: 60 * 1000,
            component: MinuteGrid,
        },
        'quarter-hour': {
            duration: 15 * 60 * 1000,
            component: QuarterHourGrid,
        },
        'hour': {
            duration: 60 * 60 * 1000,
            component: HourGrid,
        },
        'four-hours': {
            duration: 4 * 60 * 60 * 1000,
            component: FourHourGrid,
        },
        'day': {
            duration: 24 * 60 * 60 * 1000,
            component: DayGrid,
        },
        'week': {
            duration: 7 * 24 * 60 * 60 * 1000,
            component: WeekGrid,
        },
        'month': {
            duration: 30 * 24 * 60 * 60 * 1000,
            component: MonthGrid,
        },
        'quarter': {
            duration: 91.25 * 24 * 60 * 60 * 1000,
            component: QuarterGrid,
        },
        'year': {
            duration: 365 * 24 * 60 * 60 * 1000,
            component: YearGrid,
        },
        'decade': {
            duration: 10 * 365 * 24 * 60 * 60 * 1000,
            component: DecadeGrid,
        },
        'century': {
            duration: 100 * 365 * 24 * 60 * 60 * 1000,
            component: CenturyGrid,
        },
    }
    let onlyMinWidths = Object.fromEntries(Object.entries(intervals).filter(([_, {duration}]) => {
        return duration / timePerPixel > minWidth
    }))

    let components = Object.entries(onlyMinWidths).sort(([_, {duration: duration1}], [__, {duration: duration2}]) => duration1 - duration2).map(([key, {component}]) => [key, component])
    let [[key1, Grid1], [key2, Grid2], [key3, Grid3]] = components.slice(0, 3)

    return <>
        {Grid3 && <Grid3 key={key3 as string}/>}
        {Grid2 && <Grid2 key={key2 as string}/>}
        {Grid1 && <Grid1 key={key1 as string}/>}
    </>
}