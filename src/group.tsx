import React, {useRef} from 'react'
import {
    useAnimate,
    useEventAndGroupIds,
    useEventIdsOrderedForPainting,
    useEventPositionsInGroup,
    useGroupHeights,
    useGroupIds,
    useGroupIndices,
    useGroupOffsets,
    useInitialized,
    useNumberOfGroups,
    useSize,
    useSpringConfig,
} from './store/hooks'
import {EventComponent as DefaultEventComponent} from './presentational/event'
import {EventComponentType} from './event'
import {DragOffset} from './timeline'
import {animated, useSpring} from 'react-spring'
import {DefaultGroupBackground, DefaultGroupLabel} from "./presentational/group"
import {AsGroupBackground, AsGroupLabelBackground, AsGroupLabels, OnForeground} from "./layers"

export type GroupBackgroundPresentationalProps = {
    width: number,
    y: number,
    height: number
    color: string
    groupIndex: number
    numberOfGroups: number
}

export type GroupLabelPresentationalProps = {
    width: number,
    x: number,
    y: number,
    height: number
    color: string
    groupIndex: number
    numberOfGroups: number
}

export type GroupBackgroundProps = {
    groupId: string,
    y: number,
    height: number
}

export function createGroupBackground<T extends GroupBackgroundPresentationalProps>(component: React.FC<T>) {
    let AnimatedComponent = animated(component)

    let GroupBackground: React.FC<GroupBackgroundProps> = (
        {
            groupId,
            y,
            height
        },
    ) => {
        let groupHeights = useGroupHeights()
        let groupOffsets = useGroupOffsets()
        let groupIndices = useGroupIndices()
        let numberOfGroups = useNumberOfGroups()

        let groupHeight = groupHeights[groupId]
        let groupOffset = groupOffsets[groupId]
        let groupIndex = groupIndices[groupId]


        let {width} = useSize()
        let animate = useAnimate()
        let initialized = useInitialized()
        let springConfig = useSpringConfig()

        let ref = useRef<SVGGElement>(null)

        let [{ySpring, heightSpring}] = useSpring({
            ySpring: y,
            heightSpring: height,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, groupOffset, groupIndex, animate, initialized, groupHeight, height])

        return <g ref={ref} className={"react-timeline-group-background"} id={groupId}>
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

export function createGroupLabel<T extends GroupLabelPresentationalProps>(component: React.FC<T>) {
    let AnimatedComponent = animated(component)

    let GroupLabel: React.FC<GroupBackgroundProps> = (
        {
            groupId,
            y,
            height,
        },
    ) => {
        let groupHeights = useGroupHeights()
        let groupOffsets = useGroupOffsets()
        let groupIndices = useGroupIndices()
        let numberOfGroups = useNumberOfGroups()

        let groupHeight = groupHeights[groupId]
        let groupOffset = groupOffsets[groupId]
        let groupIndex = groupIndices[groupId]


        let animate = useAnimate()
        let initialized = useInitialized()
        let springConfig = useSpringConfig()

        let ref = useRef<SVGGElement>(null)

        let [{ySpring, heightSpring}] = useSpring({
            ySpring: y,
            heightSpring: height,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, groupOffset, groupIndex, animate, initialized, groupHeight, height])

        return <g ref={ref} className={"react-timeline-group-label"} id={groupId}>
            {/* @ts-ignore */}
            <AnimatedComponent
                x={0}
                width={80}
                y={ySpring}
                height={heightSpring}
                groupIndex={groupIndex}
                numberOfGroups={numberOfGroups}
            />
        </g>
    }
    return GroupLabel
}

export const GroupBackground = createGroupBackground(DefaultGroupBackground)
export const GroupLabel = createGroupLabel(DefaultGroupLabel)

export type TimelineGroupProps = {
    EventComponent?: EventComponentType
    eventHeight?: number
    eventDistance?: number,
    groupPadding?: number
    minHeight?: number
}

export const TimelineEvents: React.FC<TimelineGroupProps> = (
    {
        EventComponent,
        eventHeight = 25,
        eventDistance = 8,
        groupPadding = 30,
        minHeight = 50
    }) => {

    let events = useEventIdsOrderedForPainting()
    let groups = useGroupIds()
    let eventToGroup = useEventAndGroupIds()
    let eventPositions = useEventPositionsInGroup()
    let groupHeights = useGroupHeights()
    let Component = EventComponent || DefaultEventComponent

    let groupHeightsPixel = Object.fromEntries(groups.map(groupId => [groupId, Math.max(minHeight, eventHeight * groupHeights[groupId] + eventDistance * Math.max(groupHeights[groupId] - 1, 0) + groupPadding)]))
    let groupYs = groups.reduce<[number, Record<string, number>]>((agg, groupId) => {
        return [agg[0] + groupHeightsPixel[groupId], {...agg[1], [groupId]: agg[0]}]
    }, [0, {}])[1]

    let {height} = useSize()
    return <>
        <AsGroupBackground>
            {groups.map(groupId => <GroupBackground
                key={groupId}
                groupId={groupId}
                y={groupYs[groupId]}
                height={groupHeightsPixel[groupId]}/>)}
        </AsGroupBackground>
        <OnForeground>
            <DragOffset>
                {events.map((eventId) => {
                    let groupId = eventToGroup[eventId]
                    let positionInGroup = eventPositions[eventId]
                    return <React.Fragment key={eventId}>
                        <Component
                            id={eventId}
                            eventHeight={eventHeight}
                            y={groupPadding / 2 + (eventHeight + eventDistance) * positionInGroup + groupYs[groupId]}
                            groupHeight={groupHeightsPixel[groupId]}/>
                    </React.Fragment>
                })}
            </DragOffset>
        </OnForeground>
        <AsGroupLabelBackground>
            <rect width={80} height={height} fill={"rgba(250, 250, 250, 1)"} stroke={"transparent"}/>
            <rect x={80} y={0} width={1} height={height} fill={"lightgray"}/>
        </AsGroupLabelBackground>
        <AsGroupLabels>
            {groups.map(groupId => <GroupLabel
                key={groupId}
                groupId={groupId}
                y={groupYs[groupId]}
                height={groupHeightsPixel[groupId]}/>)}
        </AsGroupLabels>
    </>
}
