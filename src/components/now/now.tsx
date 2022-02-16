import React, {useEffect, useState} from "react"
import {animated, useSpring} from "@react-spring/web"

import {useCanvasHeight, useTimePerPixelAnchor, useTimeZero} from "../canvas/canvas"

export const Now: React.FC = () => {
    let height = useCanvasHeight()
    let timeZero = useTimeZero()
    let timePerPixel = useTimePerPixelAnchor()

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

    let xSpring = nowSpring.to(now => (now - timeZero) / timePerPixel)

    return <>
        <animated.line className={"timely non-scaling-stroke"} stroke={"red"} x1={xSpring} x2={xSpring} y1={0} y2={height}/>
    </>
}