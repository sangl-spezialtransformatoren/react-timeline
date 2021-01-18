import React from 'react'
import {EventComponent} from './presentational'
import {animated, useSpring} from 'react-spring'
import {useAnimate, useGetPositionsInGroup, useGroupPositions, useInitialized, useSpringConfig} from "./store/hooks"

export const TranslateY: React.FC<{ y: number }> = ({y, children}) => {
    let springConfig = useSpringConfig()
    let animate = useAnimate()
    let initialized = useInitialized()

    let [{ySpring}] = useSpring({
        ySpring: y,
        config: springConfig,
        immediate: !animate || !initialized,
    }, [springConfig, y, animate, initialized])
    let translate = ySpring.to(y => `translate(0 ${y})`)
    return <animated.g transform={translate}>{children}</animated.g>
}

export const EventGroups: React.FC = () => {
    let groupPositions = useGroupPositions()

    return <>
        {Object.entries(groupPositions).map(([groupId, position], index) => {
            return <TranslateY y={20 * position + 20 * index} key={groupId}>
                <EventGroup groupId={groupId}/>
            </TranslateY>
        })
        }
    </>
}

export const EventGroup: React.FC<{ groupId: string }> = ({groupId}) => {
    let eventsAndPositions = useGetPositionsInGroup(groupId)

    return <>
        {Object.entries(eventsAndPositions).map(([eventId, position]) => {
            return <TranslateY y={22 * position}>
                <EventComponent id={eventId}/>
            </TranslateY>
        })}
    </>
}