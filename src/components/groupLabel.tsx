import React, {useMemo, useRef} from "react"
import {
    useAnimate,
    useEventHeight,
    useEventMargin,
    useGroupHeights,
    useGroupIds,
    useGroupIndices,
    useGroupOffsets,
    useGroupPadding,
    useInitialized,
    useMapGroupIdToProps,
    useMinGroupHeight,
    useNumberOfGroups,
    useSpringConfig
} from "../store/hooks"
import {AsGroupLabels} from "../context/canvasContext"
import {DefaultGroupLabel} from "../presentational/group"
import {animated, useSpring} from "react-spring"

export const GroupLabel = createGroupLabel(DefaultGroupLabel)

export type GroupLabelProps = {
    groupId: string,
    groupHeight: number,
    groupIndex: number,
    groupOffset: number,
    numberOfGroups: number,
    y: number,
    height: number
}

export type GroupLabelPresentationalProps = GroupLabelProps & {
    width: number,
    x: number,
    y: number,
    height: number
}

export function createGroupLabel<T extends GroupLabelPresentationalProps>(component: React.FC<T>) {
    // TODO: Add event listener to resize, to register the drawer width
    let AnimatedComponent = animated(component)

    let GroupLabel: React.FC<GroupLabelProps> = (
        {
            groupId,
            y,
            height,
            children,
            groupOffset,
            groupHeight,
            groupIndex,
            numberOfGroups,
            ...props
        },
    ) => {
        // Redux state
        let animate = useAnimate()
        let initialized = useInitialized()
        let springConfig = useSpringConfig()

        // Refs
        let ref = useRef<SVGGElement>(null)

        // Springs
        let [{ySpring, heightSpring}] = useSpring({
            ySpring: y,
            heightSpring: height,
            config: springConfig,
            immediate: !animate || !initialized,
        }, [springConfig, animate, initialized, groupHeight, height, y])

        return <g ref={ref} className={'react-timeline-group-label'} id={groupId}>
            {/* @ts-ignore */}
            <AnimatedComponent
                x={0}
                width={60}
                y={ySpring}
                height={heightSpring}
                groupIndex={groupIndex}
                numberOfGroups={numberOfGroups}
                {...props}
            />
        </g>
    }
    return React.memo(GroupLabel)
}

export const GroupLabels: React.FC = () => {
    // Redux state
    let groups = useGroupIds()
    let groupHeights = useGroupHeights()
    let mapGroupIdToProps = useMapGroupIdToProps()
    let minHeight = useMinGroupHeight()
    let groupPadding = useGroupPadding()
    let eventDistance = useEventMargin()
    let eventHeight = useEventHeight()
    let groupIndices = useGroupIndices()
    let groupOffsets = useGroupOffsets()
    let numberOfGroups = useNumberOfGroups()

    // Calculated values
    // TODO: Move into Redux selectors
    let groupHeightsPixel = useMemo(() => {
        return Object.fromEntries(groups.map(groupId => [groupId, Math.max(minHeight, eventHeight * groupHeights[groupId] + eventDistance * Math.max(groupHeights[groupId] - 1, 0) + groupPadding)]))
    }, [minHeight, eventHeight, groupHeights, eventDistance, groupPadding])

    let groupYs = useMemo(() => {
        return groups.reduce<[number, Record<string, number>]>((agg, groupId) => {
            return [agg[0] + groupHeightsPixel[groupId], {...agg[1], [groupId]: agg[0]}]
        }, [0, {}])[1]
    }, [groupHeightsPixel, groups])

    let groupProps = useMemo(() => {
        return Object.fromEntries(groups.map(groupId => [groupId, {
            key: groupId,
            groupId: groupId,
            y: groupYs[groupId],
            height: groupHeightsPixel[groupId],
            groupHeight: groupHeights[groupId],
            groupIndex: groupIndices[groupId],
            groupOffset: groupOffsets[groupId],
            numberOfGroups: numberOfGroups,
            ...mapGroupIdToProps[groupId]
        }]))
    }, [groups, groupYs, groupHeightsPixel, groupHeights, groupIndices, groupOffsets, numberOfGroups, mapGroupIdToProps])

    return <>
        <AsGroupLabels>
            {groups.map(groupId => <GroupLabel {...groupProps[groupId]}/>)}
        </AsGroupLabels>
    </>
}
