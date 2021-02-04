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
    TemporalGridComponent,
} from '../components/grid'
import {useSize, useTimePerPixel} from '../store/hooks'
import React, {useMemo} from 'react'
import {isWeekend} from 'date-fns'
import {Grid} from '../context/canvasContext'
import {DragOffset} from '../components/canvas'

const DefaultGrid: TemporalGridComponent = ({x}) => {
    let {height} = useSize()
    return <>
        <rect x={x} y={0} width={1} height={height} fill={'rgba(0,0,0,0.1)'} />
    </>
}

export const MinuteGrid = createMinuteGrid(DefaultGrid)
export const QuarterHourGrid = createQuarterHourGrid(DefaultGrid)
export const HourGrid = createHourGrid(DefaultGrid)
export const FourHourGrid = createFourHourGrid(DefaultGrid)
const DefaultDayGrid: TemporalGridComponent = ({x, date, width}) => {
    let {height} = useSize()
    let weekend = useMemo(() => {
        return isWeekend(date)
    }, [date])
    return <>
        <rect x={x} y={0} width={1} height={height} fill={weekend ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.1)'} />
        {weekend && <rect x={x} y={0} width={width} height={height} fill={'rgba(0,0,0,0.02)'} />}
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

    let intervals: {name: string, duration: number, component: React.FC}[] = [
        {
            name: 'minute',
            duration: 60 * 1000,
            component: MinuteGrid,
        },
        {
            name: 'quarter-hour',
            duration: 15 * 60 * 1000,
            component: QuarterHourGrid,
        },
        {
            name: 'hour',
            duration: 60 * 60 * 1000,
            component: HourGrid,
        },
        {
            name: 'four-hours',
            duration: 4 * 60 * 60 * 1000,
            component: FourHourGrid,
        },
        {
            name: 'day',
            duration: 24 * 60 * 60 * 1000,
            component: DayGrid,
        },
        {
            name: 'week',
            duration: 7 * 24 * 60 * 60 * 1000,
            component: WeekGrid,
        },
        {
            name: 'month',
            duration: 30 * 24 * 60 * 60 * 1000,
            component: MonthGrid,
        },
        {
            name: 'quarter',
            duration: 91.25 * 24 * 60 * 60 * 1000,
            component: QuarterGrid,
        },
        {
            name: 'year',
            duration: 365 * 24 * 60 * 60 * 1000,
            component: YearGrid,
        },
        {
            name: 'decade',
            duration: 10 * 365 * 24 * 60 * 60 * 1000,
            component: DecadeGrid,
        },
        {
            name: 'century',
            duration: 100 * 365 * 24 * 60 * 60 * 1000,
            component: CenturyGrid,
        },
    ]

    // Returns [false, false, true, true]
    let biggerThanMinWidth = intervals.map(interval => {
        return interval.duration / timePerPixel > minWidth
    })

    let show = biggerThanMinWidth.map((value, index) => value && (biggerThanMinWidth?.[index - 3] === false || biggerThanMinWidth?.[index - 3] === undefined))
    let render = show.map((value, index) => value || !!show?.[index - 1])

    return <Grid>
        <DragOffset>
            {intervals.map(({name, component: Component}, index) => {
                return render[index] && <g visibility={show[index] ? 'show' : 'hidden'} key={name}><Component /></g>
            })}
        </DragOffset>
    </Grid>
}