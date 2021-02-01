import React, {useMemo, useRef} from "react"
import {animated, useSpring} from "react-spring"
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
    useSize,
    useSpringConfig
} from "../store/hooks"
import {DefaultGroupBackground} from "../presentational/group"
import {AsGroupBackground} from "../context/canvasContext"

export type GroupBackgroundProps = {
    groupId: string,
    groupHeight: number,
    groupIndex: number,
    groupOffset: number,
    numberOfGroups: number,
    y: number,
    height: number
}

export type GroupBackgroundPresentationalProps = GroupBackgroundProps & {
    width: number,
    y: number,
    height: number
}


export function createGroupBackground<T extends GroupBackgroundPresentationalProps>(component: React.FC<T>) {
    let AnimatedComponent = animated(component)

    let GroupBackground: React.FC<GroupBackgroundProps> = (
        {
            groupId,
            y,
            height,
            children,
            groupIndex,
            groupHeight,
            groupOffset,
            numberOfGroups,
            ...props
        },
    ) => {
        // Redux state
        let {width} = useSize()
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
        }, [springConfig, groupOffset, groupIndex, animate, initialized, groupHeight, height, y])

        return <g ref={ref} className={'react-timeline-group-background'} id={groupId}>
            {/* @ts-ignore */}
            <AnimatedComponent
                y={ySpring}
                height={heightSpring}
                width={width}
                numberOfGroups={numberOfGroups}
                groupIndex={groupIndex}
                groupId={groupId}
                groupOffset={groupOffset}
                groupHeight={groupHeight}
                {...props}
            />
        </g>
    }
    return React.memo(GroupBackground)
}


export const GroupBackground = createGroupBackground(DefaultGroupBackground)


export const GroupBackgrounds: React.FC = () => {
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
        <AsGroupBackground>
            {groups.map(groupId => <GroupBackground {...groupProps[groupId]}/>)}
        </AsGroupBackground>
    </>
}

