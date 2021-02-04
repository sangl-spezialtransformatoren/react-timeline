import React, {useEffect, useState} from 'react'
import {useAnimate, useDateZero, useHeaderHeight, useInitialized, useSize, useSpringConfig} from '../store/hooks'
import {animated, to, useSpring} from 'react-spring'
import {useTimePerPixelSpring} from '../context'
import {OnEventSpace} from "../context/canvasContext"
import {DragOffset} from '../components/canvas'

export const Now: React.FC = () => {
    let dateZero = useDateZero()
    let springConfig = useSpringConfig()
    let animate = useAnimate()
    let initialized = useInitialized()
    let timePerPixelSpring = useTimePerPixelSpring()
    let {height} = useSize()
    let headerHeight = useHeaderHeight()

    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        let interval = setTimeout(() => {
            return setInterval(() => setNow(Date.now()), 1000)
        }, 1000 - new Date().getMilliseconds())

        return () => {
            clearInterval(interval)
        }
    }, [])

    let [{nowSpring}] = useSpring({
        nowSpring: now.valueOf(),
        config: springConfig,
        immediate: !animate || !initialized,
    }, [dateZero, now])


    let x = to([nowSpring, timePerPixelSpring], (now, timePerPixel) => (now - dateZero.valueOf()) / timePerPixel)
    return <OnEventSpace>
        <DragOffset>
            <animated.rect x={x} y={0} width={1} height={height - headerHeight}/>
        </DragOffset>
    </OnEventSpace>
}