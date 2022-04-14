import React, {useEffect, useState} from "react"
import {animated, to, useSpring} from "@react-spring/web"

import {useCanvasHeight, useTimePerPixelSpring, useTimeStartSpring} from "../canvas/canvasStore"
import {round} from "../../functions/round"

export const Now: React.FC = () => {
    let height = useCanvasHeight()
    let timeStartSpring = useTimeStartSpring()
    let timePerPixelSpring = useTimePerPixelSpring()

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
        <animated.line className={"non-scaling-stroke"} stroke={"red"} shapeRendering={"geometricPrecision"}
                       x1={xSpring} x2={xSpring} y1={0} y2={height}/>
    </>
}