import React, {useEffect, useState} from 'react'
import {useAnimate, useDateZero, useInitialized, useSize, useSpringConfig} from '../store/hooks'
import {animated, to, useSpring} from 'react-spring'
import {useTimePerPixelSpring} from '../context'

export const Now: React.FC = () => {
    let dateZero = useDateZero()
    let springConfig = useSpringConfig()
    let animate = useAnimate()
    let initialized = useInitialized()
    let timePerPixelSpring = useTimePerPixelSpring()
    let {height} = useSize()

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
    return <animated.rect x={x} y={0} width={1} height={height} />
}