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
import {useResizeObserver} from './hooks'
import {animated, useSpring} from 'react-spring'

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

export type GroupBackgroundProps = {
    groupId: string,
    eventHeight?: number
    eventDistance?: number,
    groupPadding?: number
}
export const GroupBackground: React.FC<GroupBackgroundProps> = (
    {groupId, eventHeight = 20, eventDistance = 4, groupPadding = 20},
) => {
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
        ySpring: eventHeight * groupOffsets[groupId] + eventDistance * (groupOffsets[groupId] - groupIndices[groupId]) + groupPadding * groupIndices[groupId],
        heightSpring: !last ? eventHeight * groupHeights[groupId] + eventDistance * Math.max(groupHeights[groupId] - 1, 0) + groupPadding : height - eventHeight * groupOffsets[groupId] + eventDistance * (groupOffsets[groupId] - groupIndices[groupId]) + groupPadding * groupIndices[groupId],
        config: springConfig,
        immediate: !animate || !initialized,
    }, [springConfig, groupOffsets[groupId], groupIndices[groupId], animate, initialized, groupHeights[groupId], height])

    return <g ref={ref}><AnimatedGroupElement y={ySpring} height={heightSpring} width={width}
                                              color={groupIndices[groupId] % 2 === Object.keys(groupIndices).length % 2 ? 'rgba(0,0,0,0.05)' : 'transparent'} />
    </g>
}

export type TimelineGroupProps = {
    EventComponent?: EventComponentType
    eventHeight?: number
    eventDistance?: number,
    groupPadding?: number
}
export const TimelineEvents: React.FC<TimelineGroupProps> = (
    {
        EventComponent,
        eventHeight = 20,
        eventDistance = 8,
        groupPadding = 24,
    }) => {

    let events = useEventIdsOrderedByLayerAndStartDate()
    let groups = useGroupIds()
    let eventToGroup = useEventAndGroupIds()
    let eventPositions = useEventPositionsInGroup()
    let groupHeights = useGroupHeights()
    let groupOffsets = useGroupOffsets()
    let groupPositions = useGroupIndices()
    let Component = EventComponent || DefaultEventComponent


    return <>
        {groups.map(groupId => <GroupBackground groupId={groupId} key={groupId} eventHeight={eventHeight}
                                                eventDistance={eventDistance} groupPadding={groupPadding} />)}
        <DragOffset>
            {events.map((eventId) => {
                let groupId = eventToGroup[eventId]
                let positionInGroup = eventPositions[eventId]
                let groupOffset = groupOffsets[groupId]
                let groupPosition = groupPositions[groupId]
                return <React.Fragment key={eventId}>
                    <Component
                        id={eventId}
                        eventHeight={eventHeight}
                        y={groupPadding / 2 + (eventHeight + eventDistance) * positionInGroup + eventHeight * groupOffset + eventDistance * (groupOffset - groupPosition) + groupPadding * groupPosition}
                        groupHeight={eventHeight * groupHeights[groupId] + eventDistance * Math.max(groupHeights[groupId] - 1, 0) + groupPadding} />
                </React.Fragment>
            })}
        </DragOffset>

    </>
}
