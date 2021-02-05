import React, {useMemo, useRef} from 'react'
import {
    useAnimate,
    useContentHeight,
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
import {AsGroupLabels} from '../context/canvasContext'
import {DefaultGroupLabel, DefaultGroupLabelBackground} from '../presentational/group'
import {animated, useSpring} from 'react-spring'

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

export type GroupLabelBackgroundPresentationalProps = {
    y: number
    height: number
}

export function createGroupLabel<T extends GroupLabelPresentationalProps>(component: React.FC<T>) {
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

export const GroupLabels: React.FC<{component?: React.FC<GroupLabelPresentationalProps>, background?: React.FC<GroupLabelBackgroundPresentationalProps>}> = React.memo(
    function GroupLabels({component = DefaultGroupLabel, background = DefaultGroupLabelBackground}) {
        let Component = useMemo(() => {
            return createGroupLabel(component)
        }, [component])

        let Background = useMemo(() => {
            return background
        }, [background])

        // Redux state
        let groups = useGroupIds()
        let groupHeights = useGroupEventHeights()
        let mapGroupIdToProps = useMapGroupIdToProps()
        let groupIndices = useGroupIndices()
        let groupOffsets = useGroupOffsets()
        let numberOfGroups = useNumberOfGroups()
        let groupHeightsPixel = useGroupHeights()
        let groupYs = useGroupYs()
        let {height} = useSize()
        let contentHeight = useContentHeight()

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
            <AsGroupLabels>
                <Background y={-300} height={Math.max(height, contentHeight) + 600} />
                {groups.map(groupId => <Component {...groupProps[groupId]} />)}
            </AsGroupLabels>
        </>
    })
