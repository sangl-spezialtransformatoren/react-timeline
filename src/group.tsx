import React from 'react'
import {
    useEventAndGroupIds,
    useEventIdsOrderedByLayerAndStartDate,
    useEventPositionsInGroup,
    useGroupHeights,
    useGroupOffsets,
    useGroupPositions,
} from './store/hooks'
import {EventComponent as DefaultEventComponent} from './presentational/event'
import {EventComponentType} from './event'
import {DragOffset} from './timeline'


export const TimelineEvents: React.FC<{EventComponent?: EventComponentType}> = ({EventComponent}) => {

    let events = useEventIdsOrderedByLayerAndStartDate()
    let eventToGroup = useEventAndGroupIds()
    let eventPositions = useEventPositionsInGroup()
    let groupHeights = useGroupHeights()
    let groupOffsets = useGroupOffsets()
    let groupPositions = useGroupPositions()
    let Component = EventComponent || DefaultEventComponent

    return <DragOffset>
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
}
