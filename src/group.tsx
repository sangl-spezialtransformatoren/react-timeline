import React, {useEffect} from 'react'
import {
    useAnimate,
    useEventAndGroupIds,
    useEventIdsOrderedByLayerAndStartDate,
    useEventPositionsInGroup,
    useGroupHeights,
    useGroupIds,
    useGroupIndices,
    useGroupOffsets,
    useInitialized,
    useSize,
    useSpringConfig,
} from './store/hooks'
import {useSetGroupPosition} from './store/actions'
import {EventComponent as DefaultEventComponent} from './presentational/event'
import {EventComponentType} from './event'
import {DragOffset} from './timeline'
import {useResizeObserver} from "./hooks"
import {animated, useSpring} from "react-spring"

export type GroupPresentationalProps = {
    width: number,
    y: number,
    height: number
    color: string
}

export const GroupBackgroundElement: React.FC<GroupPresentationalProps> = ({width, y, height, color}) => {
    return <>
        <rect x={0}
              width={width}
              y={y}
              height={height}
              fill={color}
              stroke={'transparent'}
        />
    </>
}

const AnimatedGroupElement = animated(GroupBackgroundElement)

export const GroupBackground: React.FC<{ groupId: string }> = ({groupId}) => {
    let groupHeights = useGroupHeights()
    let groupOffsets = useGroupOffsets()
    let groupIndices = useGroupIndices()

    let {width, height} = useSize()
    let setGroupPosition = useSetGroupPosition()
    let animate = useAnimate()
    let initialized = useInitialized()
    let springConfig = useSpringConfig()

    let [ref, size] = useResizeObserver<SVGGElement>()

    useEffect(() => {
        setGroupPosition({groupId, ...size})
    }, [size])

    let last = false
    if (groupIndices[groupId] === Math.max(...Object.values(groupIndices))) {
        last = true
    }


    let [{ySpring, heightSpring}] = useSpring({
        ySpring: 24 * groupOffsets[groupId] + 20 * groupIndices[groupId] - 10,
        heightSpring: !last ? 24 * groupHeights[groupId] + 20 : height - 24 * groupOffsets[groupId] + 20 * groupIndices[groupId] - 10,
        config: springConfig,
        immediate: !animate || !initialized,
    }, [springConfig, groupOffsets[groupId], groupIndices[groupId], animate, initialized, groupHeights[groupId], height])

    return <g ref={ref}><AnimatedGroupElement y={ySpring} height={heightSpring} width={width}
                                              color={groupIndices[groupId] % 2 === 1 ? "rgba(0,0,0,0.05)" : "transparent"}/>
    </g>
}

export const TimelineEvents: React.FC<{ EventComponent?: EventComponentType }> = ({EventComponent}) => {

    let events = useEventIdsOrderedByLayerAndStartDate()
    let groups = useGroupIds()
    let eventToGroup = useEventAndGroupIds()
    let eventPositions = useEventPositionsInGroup()
    let groupHeights = useGroupHeights()
    let groupOffsets = useGroupOffsets()
    let groupPositions = useGroupIndices()
    let Component = EventComponent || DefaultEventComponent


    return <>
        {groups.map(groupId => <GroupBackground groupId={groupId} key={groupId}/>)}
        <DragOffset>
            {events.map((eventId) => {
                let groupId = eventToGroup[eventId]
                let positionInGroup = eventPositions[eventId]
                let groupOffset = groupOffsets[groupId]
                let groupPosition = groupPositions[groupId]
                return <React.Fragment key={eventId}>
                    <Component
                        id={eventId}
                        y={4 + 24 * positionInGroup + 24 * groupOffset + 20 * groupPosition}
                        groupHeight={24 * groupHeights[groupId] - 4}/>
                </React.Fragment>
            })}
        </DragOffset>

    </>
}
