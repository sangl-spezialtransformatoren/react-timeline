import React from "react"
import {useTimePerPixelSpring} from "./context"
import {useDateZero, useGetHeaderIntervals} from "./store/hooks"
import {animated, to} from "react-spring"
import {generateDayIntervals, intervalCreatorOptions} from "./functions"

type GridProps<T = {}> = { x: number, y: number, width: number, height: number } & T
type TemporalGridProps = GridProps<{ date: Date | number }>
export type GridComponent<T> = React.FC<T & { x: number, width: number, height: number }>
export type TemporalGridComponent<T = {}> = React.FC<TemporalGridProps & T>

export function createGridElement<T>(component: GridComponent<T>) {
    let GridElement: React.FC<{ start: Date | number, end: Date | number } & T> = (props) => {
        let {start, end, children, ...otherProps} = props
        let timePerPixelSpring = useTimePerPixelSpring()
        let dateZero = useDateZero()

        let x = to([timePerPixelSpring], (timePerPixel) => ((start.valueOf() - dateZero.valueOf()) / timePerPixel.valueOf()))
        let y = 0
        let width = to([timePerPixelSpring], (timePerPixel) => (end.valueOf() - start.valueOf()) / timePerPixel)
        let height = 1000

        let AnimatedGrid = animated(component)

        // @ts-ignore
        return <AnimatedGrid x={x} y={y} width={width} height={height} {...(otherProps as unknown as T)} />
    }
    return React.memo(GridElement)
}

export function createTemporalGrid<T>(component: GridComponent<T>, intervalName: string, intervalCreator: (from: Date | number, to: Date | number, options: intervalCreatorOptions) => Interval[], intervalLength: number) {
    let GridElement = createGridElement(component)
    let TemporalGrid: React.FC<Omit<T, keyof TemporalGridProps>> = (props) => {
        let {children, ...otherProps} = props

        let intervals = useGetHeaderIntervals(intervalCreator, intervalLength)
        return <>
            {intervals.map((interval) => {
                return <GridElement
                    key={intervalName + new Date(interval.start).toISOString()}
                    start={interval.start.valueOf()}
                    end={interval.end.valueOf()}
                    date={interval.start.valueOf()}
                    {...(otherProps as unknown as T)} />
            })}
        </>
    }
    return React.memo(TemporalGrid)
}

export function createDayGrid<T>(component: TemporalGridComponent<T>) {
    return createTemporalGrid(component, 'day', generateDayIntervals, 60 * 60 * 1000)
}
