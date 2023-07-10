import React, {useEffect, useState} from 'react'
import {animated, SpringValue, to, useSpring} from '@react-spring/web'
import {useCanvasHeight, useCanvasWidth, useTimePerPixel, useTimeStart} from '../Canvas/store'
import {round} from '../../functions/round'

export const CustomMarker: React.FC<{value: SpringValue<number>}> = ({value}) => {
    let canvasHeight = useCanvasHeight()
    let timeStart = useTimeStart()
    let timePerPixel = useTimePerPixel()

    let x = to([value, timeStart, timePerPixel], (x, tS, tpP) => (x - tS) / tpP)
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
    let timeStartSpring = useTimeStart()
    let timePerPixelSpring = useTimePerPixel()

    let [now, setNow] = useState<number>(new Date().valueOf())

    useEffect(() => {
        let intervalId = setInterval(() => setNow(new Date().setMilliseconds(0).valueOf()), 1000)
        return () => {
            clearInterval(intervalId)
        }
    }, [])

    let {nowSpring} = useSpring({
        nowSpring: now
    })

    let xSpring = to([nowSpring, timePerPixelSpring, timeStartSpring], (now, timePerPixel, timeStart) => round((now - timeStart) / timePerPixel))

    return <>
        <animated.line stroke={"green"} x1={xSpring} x2={xSpring} y1={0} y2={height}/>
    </>
}