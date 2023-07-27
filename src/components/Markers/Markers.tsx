import React, {useEffect} from 'react'
import {animated, SpringValue, to, useSpring} from '@react-spring/web'
import {useCanvasHeight, useCanvasWidth, useTimePerPixel, useTimeZero} from '../Canvas/store'
import {round} from '../../functions/round'

export const CustomMarker: React.FC<{value: SpringValue<number>}> = ({value}) => {
    let canvasHeight = useCanvasHeight()
    let timeZero = useTimeZero()
    let timePerPixel = useTimePerPixel()

    let x = to([value, timeZero, timePerPixel], (x, tS, tpP) => (x - tS) / tpP)
    return <animated.line
        y1={0}
        y2={canvasHeight}
        x1={x}
        x2={x}
        stroke={'pink'}
    />
}

export const TimeStart: React.FC = () => {
    let canvasHeight = useCanvasHeight()
    return <animated.line
        y1={0}
        y2={canvasHeight}
        x1={0}
        x2={0}
        stroke={'red'}
    />
}
export const TimeEnd: React.FC = () => {
    let canvasHeight = useCanvasHeight()
    let canvasWidth = useCanvasWidth()

    return <animated.line
        y1={0}
        y2={canvasHeight}
        x1={canvasWidth}
        x2={canvasWidth}
        stroke={'red'}
    />
}

export const Now: React.FC = () => {
    let height = useCanvasHeight()
    let timeZeroSpring = useTimeZero()
    let timePerPixelSpring = useTimePerPixel()

    let [{nowSpring}, api] = useSpring(() => ({
        nowSpring: new Date().valueOf()
    }))
    useEffect(() => {
        let intervalId = setInterval(() => api.start({nowSpring: new Date().setMilliseconds(0).valueOf()}), 1000)
        return () => {
            clearInterval(intervalId)
        }
    }, [api])

    let xSpring = to([nowSpring, timePerPixelSpring, timeZeroSpring], (now, timePerPixel, timeStart) => round((now - timeStart) / timePerPixel))
    return <>
        <animated.line stroke={'red'} x1={xSpring} x2={xSpring} y1={0} y2={height}/>
    </>
}