import React, {useContext, useEffect, useState} from "react"
import {TimelineContext} from "../definitions"
import {getDefaultTimeZone} from "../index"
import {animated, to} from "react-spring"
import {generateDayIntervals, generateWeekIntervals} from "../functions"
import {DefaultDayHeader} from "../presentational/DefaultDayHeader"

export type DayHeaderComponent = React.FC<{ x: number, y: number, width: number, height: number }>

const HeaderElement: React.FC<{ interval: Interval, component?: DayHeaderComponent }> = ({interval, component}) => {
    let {timePerPixelSpring, startDateSpring} = useContext(TimelineContext)
    let x = to([timePerPixelSpring, startDateSpring], (timePerPixel, startDate) => ((interval.start.valueOf() - startDate.valueOf()) / timePerPixel.valueOf()))
    let y = 0
    let width = to([timePerPixelSpring], (timePerPixel) => (interval.end.valueOf() - interval.start.valueOf()) / timePerPixel)
    let height = 20

    component = component || DefaultDayHeader
    let AnimatedHeader = animated(component)
    return <AnimatedHeader x={x} y={y} width={width} height={height}/>
}

export const DayHeader: React.FC<{ timeZone?: string }> = ({timeZone = getDefaultTimeZone()}) => {
    let {startDate, endDate} = useContext(TimelineContext)
    let [dayIntervals, setDayIntervals] = useState<Interval[]>([])

    useEffect(() => {
        let temporalWidth = (endDate.valueOf() - startDate.valueOf())
        let from = startDate.valueOf() - 0.3 * temporalWidth
        let to = endDate.valueOf() + 0.3 * temporalWidth
        let intervals = generateDayIntervals(from, to, timeZone)
        setDayIntervals(intervals)
    }, [startDate, endDate])

    return <g>
        {dayIntervals.map((interval) => {
            return <HeaderElement
                interval={interval}
                key={new Date(interval.start).toISOString()}
                component={DefaultDayHeader}/>
        })}
    </g>
}

export const WeekHeader: React.FC<{ timeZone?: string, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }> = (
    {
        timeZone = getDefaultTimeZone(),
        weekStartsOn = 1
    }) => {

    let {startDate, endDate} = useContext(TimelineContext)
    let [weekIntervals, setWeekIntervals] = useState<Interval[]>([])

    useEffect(() => {
        let temporalWidth = (endDate.valueOf() - startDate.valueOf())
        let from = startDate.valueOf() - 0.3 * temporalWidth
        let to = endDate.valueOf() + 0.3 * temporalWidth

        let intervals = generateWeekIntervals(from, to, timeZone, weekStartsOn)
        setWeekIntervals(intervals)
    }, [startDate, endDate])


    return <g>
        {weekIntervals.map((interval) => {
            return <HeaderElement interval={interval}/>
        })}
    </g>
}