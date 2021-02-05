import React, {useMemo, useRef} from 'react'
import {animated, useSpring} from 'react-spring'
import {
    useAnimate,
    useGroupEventHeights,
    useGroupHeights,
    useGroupIds,
    useGroupIndices,
    useGroupOffsets,
    useGroupYs,
    useInitialized,
    useMapGroupIdToProps,
    useNumberOfGroups,
    useSize,
    useSpringConfig,
} from '../store/hooks'
import {DefaultGroupBackground} from '../presentational/group'
import {AsGroupBackground} from '../context/canvasContext'

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


export const GroupBackgrounds: React.FC<{component?: React.FC<GroupBackgroundPresentationalProps>}> = React.memo(function GroupBackgrounds({component = DefaultGroupBackground}) {
    let Component = useMemo(() => {
        return createGroupBackground(component)
    }, [component])

    // Redux state
    let groups = useGroupIds()
    let groupHeights = useGroupEventHeights()
    let mapGroupIdToProps = useMapGroupIdToProps()
    let groupIndices = useGroupIndices()
    let groupOffsets = useGroupOffsets()
    let numberOfGroups = useNumberOfGroups()
    let groupHeightsPixel = useGroupHeights()
    let groupYs = useGroupYs()

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
            ...mapGroupIdToProps[groupId],
        }]))
    }, [groups, groupYs, groupHeightsPixel, groupHeights, groupIndices, groupOffsets, numberOfGroups, mapGroupIdToProps])

    return <>
        <AsGroupBackground>
            {groups.map(groupId => <Component {...groupProps[groupId]} />)}
        </AsGroupBackground>
    </>
})

