import React, {useEffect, useRef} from 'react'
import {
    useEventAndGroupIds,
    useEventIdsOrderedByLayerAndStartDate,
    useEventPositionsInGroup,
    useGroupHeights,
    useGroupIds,
    useGroupOffsets,
    useGroupPositions,
    useSize,
} from './store/hooks'
import {useSetGroupPosition} from './store/actions'
import {EventComponent as DefaultEventComponent} from './presentational/event'
import {EventComponentType} from './event'
import {DragOffset} from './timeline'


export const GroupBackground: React.FC<{groupId: string}> = ({groupId}) => {
    let groupHeights = useGroupHeights()
    let groupOffsets = useGroupOffsets()
    let groupPositions = useGroupPositions()
    let {width} = useSize()
    let ref = useRef<SVGGElement>(null)
    let setGroupPosition = useSetGroupPosition()

    let observer = useRef(new ResizeObserver(entries => {
        let firstEntry = entries[0]
        let bbox = firstEntry.target.getBoundingClientRect()
        setGroupPosition({
            groupId,
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
        })
    }))

    useEffect(() => {
        if (ref.current) {
            observer.current.observe(ref.current)
        }
        return () => {
            observer.current.disconnect()
        }
    }, [ref])

    return <g key={groupId} ref={ref}>
        <rect x={0}
              width={width}
              y={24 * groupOffsets[groupId] + 20 * groupPositions[groupId]}
              height={24 * groupHeights[groupId] + 4}
              fill={'transparent'} stroke={'transparent'} />
    </g>
}

export const TimelineEvents: React.FC<{EventComponent?: EventComponentType}> = ({EventComponent}) => {

    let events = useEventIdsOrderedByLayerAndStartDate()
    let groups = useGroupIds()
    let eventToGroup = useEventAndGroupIds()
    let eventPositions = useEventPositionsInGroup()
    let groupHeights = useGroupHeights()
    let groupOffsets = useGroupOffsets()
    let groupPositions = useGroupPositions()
    let Component = EventComponent || DefaultEventComponent

    return <>
        {groups.map(groupId => <GroupBackground groupId={groupId} key={groupId} />)}
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
                        groupHeight={24 * groupHeights[groupId] - 4} />
                </React.Fragment>
            })}
        </DragOffset>

    </>
}
