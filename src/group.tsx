import React, {useEffect} from 'react'
import {
    useAnimate,
    useEventAndGroupIds,
    useEventIdsOrderedForPainting,
    useEventPositionsInGroup,
    useGroupHeight,
    useGroupHeights,
    useGroupIds,
    useGroupIndex,
    useGroupIndices,
    useGroupOffset,
    useGroupOffsets,
    useInitialized,
    useNumberOfGroups,
    useSize,
    useSpringConfig,
} from './store/hooks'
import {useSetGroupPosition} from './store/actions'
import {EventComponent as DefaultEventComponent} from './presentational/event'
import {EventComponentType} from './event'
import {DragOffset} from './timeline'
import {useResizeObserver} from './hooks'
import {animated, useSpring} from 'react-spring'
import {DefaultGroupBackground} from "./presentational/group"
import {AsGroupBackground, OnForeground} from "./layers"

export type GroupPresentationalProps = {
    width: number,
    y: number,
    height: number
    color: string
    groupIndex: number
    numberOfGroups: number
}

export type GroupBackgroundProps = {
    groupId: string,
    eventHeight?: number
    eventDistance?: number,
    groupPadding?: number
}

export function createGroupBackground<T extends GroupPresentationalProps>(component: React.FC<T>) {
    let AnimatedComponent = animated(component)

    let GroupBackground: React.FC<GroupBackgroundProps> = (
        {
            groupId,
            eventHeight = 25,
            eventDistance = 5,
            groupPadding = 25
        },
    ) => {
        let groupHeight = useGroupHeight(groupId)
        let groupOffset = useGroupOffset(groupId)
        let groupIndex = useGroupIndex(groupId)
        let numberOfGroups = useNumberOfGroups()

        let {width, height} = useSize()
        let setGroupPosition = useSetGroupPosition()
        let animate = useAnimate()
        let initialized = useInitialized()
        let springConfig = useSpringConfig()

        let [ref, size] = useResizeObserver<SVGGElement>()

        useEffect(() => {
            setGroupPosition({groupId, ...size})
        }, [size])

        let last = groupIndex === numberOfGroups - 1

        let [{ySpring, heightSpring}] = useSpring({
            ySpring: eventHeight * groupOffset + eventDistance * (groupOffset - groupIndex) + groupPadding * groupIndex,
            heightSpring: !last ? eventHeight * groupHeight + eventDistance * Math.max(groupHeight - 1, 0) + groupPadding : height - eventHeight * groupOffset + eventDistance * (groupOffset - groupIndex) + groupPadding * groupIndex,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, groupOffset, groupIndex, animate, initialized, groupHeight, height])

        return <g ref={ref}>
            {/* @ts-ignore */}
            <AnimatedComponent
                y={ySpring}
                height={heightSpring}
                width={width}
                groupIndex={groupIndex}
                numberOfGroups={numberOfGroups}
            />
        </g>
    }
    return GroupBackground
}

export const GroupBackground = createGroupBackground(DefaultGroupBackground)

export type TimelineGroupProps = {
    EventComponent?: EventComponentType
    eventHeight?: number
    eventDistance?: number,
    groupPadding?: number
}

export const TimelineEvents: React.FC<TimelineGroupProps> = (
    {
        EventComponent,
        eventHeight = 25,
        eventDistance = 8,
        groupPadding = 25,
    }) => {

    let events = useEventIdsOrderedForPainting()
    let groups = useGroupIds()
    let eventToGroup = useEventAndGroupIds()
    let eventPositions = useEventPositionsInGroup()
    let groupHeights = useGroupHeights()
    let groupOffsets = useGroupOffsets()
    let groupPositions = useGroupIndices()
    let Component = EventComponent || DefaultEventComponent

    return <>
        <AsGroupBackground>
            {groups.map(groupId => <React.Fragment key={groupId}>
                <GroupBackground
                    groupId={groupId}
                    eventHeight={eventHeight}
                    eventDistance={eventDistance}
                    groupPadding={groupPadding}/>
            </React.Fragment>)}
        </AsGroupBackground>
        <OnForeground>
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
                            groupHeight={eventHeight * groupHeights[groupId] + eventDistance * Math.max(groupHeights[groupId] - 1, 0) + groupPadding}/>
                    </React.Fragment>
                })}
            </DragOffset>
        </OnForeground>
    </>
}
